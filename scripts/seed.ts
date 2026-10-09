/**
 * Seed de datos mínimos para probar la app en local.
 *
 * Crea (de forma idempotente):
 *   - una organización de demo
 *   - un condominio de demo
 *   - un rol ORGANIZATION_ADMIN con todos los permisos
 *   - un usuario administrador (con contraseña argon2)
 *   - la asignación usuario ↔ rol
 *
 * Uso:
 *   1. Tener un .env con MONGODB_URI (copiado de .env.example).
 *   2. npx ts-node scripts/seed.ts
 *      (o: npm run seed  — ver package.json)
 *
 * Credenciales por defecto (sobreescribibles por variables de entorno):
 *   SEED_ADMIN_EMAIL     (def. admin@demo.com)
 *   SEED_ADMIN_PASSWORD  (def. Admin1234!)
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { connect, disconnect, Schema, model, Types, Model } from 'mongoose';
import * as argon2 from 'argon2';
import { PERMISSIONS } from '../src/modules/rbac/permissions';

/** Carga variables de un archivo .env sin dependencias externas. */
function loadEnv(): void {
  try {
    const raw = readFileSync(join(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // Sin .env: se usarán solo las variables ya presentes en el entorno.
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL ?? 'admin@demo.com').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';

if (!MONGODB_URI) {
  console.error('Falta MONGODB_URI en el entorno (.env). Aborta.');
  process.exit(1);
}

// Modelos ligeros (colecciones existentes); no importamos los schemas de Nest
// para mantener el script independiente del contexto de la app.
const loose = { strict: false, timestamps: true };
const Organization = model('Organization', new Schema({}, { ...loose, collection: 'organizations' }));
const Condominium = model('Condominium', new Schema({}, { ...loose, collection: 'condominiums' }));
const Role = model('Role', new Schema({}, { ...loose, collection: 'roles' }));
const User = model('User', new Schema({}, { ...loose, collection: 'users' }));
const UserRole = model('UserRole', new Schema({}, { ...loose, collection: 'userRoles' }));

async function upsert(
  Mdl: Model<any>,
  filter: Record<string, unknown>,
  data: Record<string, unknown>,
) {
  const existing = await Mdl.findOne(filter).exec();
  if (existing) {
    await Mdl.updateOne(filter, { $set: data }).exec();
    return existing._id as Types.ObjectId;
  }
  const created = await Mdl.create({ ...filter, ...data });
  return created._id as Types.ObjectId;
}

async function main() {
  console.log('Conectando a MongoDB…');
  await connect(MONGODB_URI as string);

  // 1. Organización
  const orgId = await upsert(
    Organization,
    { name: 'Organización Demo' },
    {
      legalName: 'Demo S.A.C.',
      email: 'contacto@demo.com',
      status: 'ACTIVE',
      settings: { currency: 'PEN', timezone: 'America/Lima', locale: 'es-PE' },
    },
  );
  console.log('Organización:', orgId.toString());

  // 2. Condominio
  const condoId = await upsert(
    Condominium,
    { organizationId: orgId, code: 'DEMO-01' },
    { name: 'Villa Bonita', status: 'ACTIVE' },
  );
  console.log('Condominio:', condoId.toString());

  // 3. Rol admin con TODOS los permisos
  const roleId = await upsert(
    Role,
    { organizationId: orgId, key: 'ORGANIZATION_ADMIN' },
    {
      name: 'Administrador de Organización',
      description: 'Acceso completo (seed)',
      permissions: Object.values(PERMISSIONS),
      isSystem: true,
    },
  );
  console.log('Rol:', roleId.toString());

  // 4. Usuario admin
  const passwordHash = await argon2.hash(ADMIN_PASSWORD);
  const userId = await upsert(
    User,
    { email: ADMIN_EMAIL },
    {
      organizationId: orgId,
      firstName: 'Admin',
      lastName: 'Demo',
      passwordHash,
      status: 'ACTIVE',
    },
  );
  console.log('Usuario:', userId.toString());

  // 5. Asignación usuario ↔ rol
  await upsert(
    UserRole,
    { userId, roleId, condominiumId: null },
    { organizationId: orgId },
  );

  console.log('\n✅ Seed completo. Credenciales de acceso:');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);

  await disconnect();
}

main().catch(async (err) => {
  console.error('Error en el seed:', err);
  await disconnect();
  process.exit(1);
});
