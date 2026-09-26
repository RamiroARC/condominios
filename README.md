# CondoManager API

Backend del SaaS **CondoManager** para administración multi-tenant de condominios.
Construido con **NestJS 10 + TypeScript + MongoDB Atlas (Mongoose)**.

Esta es la **Fase 1**: núcleo de la plataforma, autenticación, control de acceso
por permisos (RBAC), aislamiento multi-tenant y los módulos de estructura
(organizaciones, condominios, edificios, departamentos, personas y ocupantes).
Los módulos financieros, de mantenimiento, reservas y comunicaciones llegan en
fases posteriores.

---

## Requisitos

- Node.js 20 LTS o superior
- npm 10+
- Un cluster de MongoDB Atlas (o instancia MongoDB) con una base **por entorno**

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
#    Copia .env.example a .env y completa los valores
cp .env.example .env   # en Windows: Copy-Item .env.example .env

# 3. Compilar
npm run build

# 4. Arrancar en desarrollo (watch)
npm run start:dev
```

La API queda expuesta bajo el prefijo global **`/api`** (por defecto en el puerto `3000`).

### Scripts

| Script | Descripción |
| --- | --- |
| `npm run build` | Compila TypeScript a `dist/` (`nest build`). |
| `npm run start` | Arranca la app compilada. |
| `npm run start:dev` | Arranca en modo watch (recarga en caliente). |
| `npm run start:prod` | Ejecuta `node dist/main.js`. |
| `npm run lint` | Linter ESLint con `--fix`. |
| `npm run test` | Tests con Jest. |

> En Windows, si PowerShell bloquea `npm.ps1` por política de ejecución, usa
> `npm.cmd run <script>` o ajusta la _Execution Policy_.

---

## Variables de entorno

Definidas en `.env` (nunca se versiona). Ver `.env.example` para la plantilla.

| Variable | Descripción |
| --- | --- |
| `NODE_ENV` | `development` \| `test` \| `staging` \| `production`. |
| `PORT` | Puerto HTTP (por defecto `3000`). |
| `MONGODB_URI` | Cadena de conexión a MongoDB. Usa una base **distinta por entorno**. |
| `JWT_SECRET` | Secreto para firmar el _access token_. Largo y aleatorio. |
| `JWT_REFRESH_SECRET` | Secreto para el _refresh token_. Distinto del anterior. |
| `JWT_ACCESS_TTL` | Vida del access token (por defecto `15m`). |
| `JWT_REFRESH_TTL` | Vida del refresh token (por defecto `7d`). |
| `THROTTLE_TTL` | Ventana de rate limiting en segundos (por defecto `60`). |
| `THROTTLE_LIMIT` | Peticiones permitidas por ventana (por defecto `120`). |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma. |

Las variables se validan al arrancar (fail-fast): si falta o es inválida una
requerida, la app no inicia.

---

## Arquitectura

### Multi-tenancy (shared database)

Todas las organizaciones comparten la misma base de datos y sus documentos se
aíslan por `organizationId`. El aislamiento se garantiza en dos capas:

1. **`TenantGuard`** — exige que el JWT traiga un `organizationId` y lo coloca en
   el contexto de la petición. El `organizationId` **nunca** se toma del body.
2. **`TenantBaseRepository`** — todo acceso a datos de negocio pasa por este
   repositorio base, que inyecta `organizationId` en **cada** query (find,
   update, delete, count, paginate). Es la defensa en profundidad contra fugas
   de datos entre organizaciones.

`Organizations` es la excepción: es una colección de **nivel plataforma**
gestionada por el `SUPER_ADMIN`, por lo que no usa `TenantGuard` ni filtra por
`organizationId`.

### Autenticación

- Login con email + contraseña; las contraseñas se cifran con **argon2**.
- **Access token** (corto) + **refresh token** (largo) con rotación en cada uso.
- El hash del refresh token se guarda en el usuario con `select: false`.
- `JwtAuthGuard` es global: todo endpoint requiere autenticación salvo los
  marcados con `@Public()`.

### Autorización (RBAC por permisos)

- Los permisos tienen el formato `modulo:accion` (p. ej. `condominiums:read`).
- Los guards evalúan **permisos**, no roles hardcodeados, de modo que se pueden
  crear roles nuevos combinando permisos sin tocar código ni redesplegar.
- `@RequirePermissions(...)` sobre un handler + `PermissionsGuard` hacen cumplir
  la política.
- Roles semilla del sistema: `SUPER_ADMIN`, `ORGANIZATION_ADMIN`,
  `CONDOMINIUM_ADMIN`, `ACCOUNTANT`, `OPERATOR`, `OWNER`, `RESIDENT`.

### Auditoría

- `AuditModule` es global. El `AuditInterceptor` (registrado como
  `APP_INTERCEPTOR`) registra automáticamente las operaciones de escritura
  (`POST`/`PATCH`/`PUT`/`DELETE`) en los handlers marcados con `@Auditable(...)`,
  solo tras una respuesta exitosa.
- La bitácora `auditLogs` es **append-only**. Si la escritura de auditoría falla,
  se registra el error pero **no** rompe el flujo principal.
- Consulta vía `GET /api/audit-logs` (requiere `audit:read`).

### Seguridad de transporte

`main.ts` aplica **helmet**, **CORS** por lista de orígenes, `ValidationPipe`
global con `whitelist` (descarta propiedades no declaradas en los DTOs) y un
`AllExceptionsFilter` para respuestas de error uniformes. El rate limiting es
global vía `ThrottlerGuard`.

---

## Estructura del proyecto

```
src/
├── main.ts                     # Bootstrap: helmet, CORS, prefijo /api, ValidationPipe
├── app.module.ts               # Módulo raíz: config, Mongoose, guards e interceptor globales
├── config/
│   ├── configuration.ts        # Config tipada desde env
│   └── env.validation.ts       # Validación fail-fast de variables de entorno
├── common/
│   ├── dto/pagination.dto.ts   # Paginación estándar
│   ├── filters/                # Filtro global de excepciones
│   └── repositories/           # TenantBaseRepository (multi-tenant)
└── modules/
    ├── auth/                   # Login/refresh/logout, JWT, estrategia Passport
    ├── rbac/                   # Permisos, decoradores, PermissionsGuard
    ├── tenant/                 # TenantGuard
    ├── organizations/          # Nivel plataforma (SUPER_ADMIN)
    ├── condominiums/           # Condominios (patrón de referencia)
    ├── buildings/              # Edificios
    ├── apartments/             # Departamentos
    ├── persons/                # Personas (propietarios/residentes)
    ├── occupants/              # Ocupación N:M apartment↔person con historial
    ├── maintenance/            # Tickets/órdenes con ciclo de vida e historial
    ├── finance/                # Conceptos, periodos, cargos y pagos
    ├── reservations/           # Áreas comunes y reservas (anti-solape)
    ├── communications/         # Anuncios con audiencia y recibos de lectura
    ├── users/                  # Schema de usuario
    └── audit/                  # Servicio, interceptor y consulta de auditoría
```

Cada módulo sigue el mismo patrón: `schema` → `repository`
(hereda `TenantBaseRepository`) → `service` → `controller` (con `TenantGuard` +
`PermissionsGuard` + `@RequirePermissions` + `@Auditable` en escrituras) →
`module`.

---

## Endpoints (resumen)

Todos bajo el prefijo `/api`. Salvo `Organizations`, requieren `organizationId`
en el JWT (multi-tenant) y el permiso correspondiente.

| Recurso | Rutas | Permisos |
| --- | --- | --- |
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` | público / autenticado |
| Organizations | `POST/GET /organizations`, `GET/PATCH /organizations/:id` | `organizations:read` / `:write` |
| Condominiums | `POST/GET /condominiums`, `GET/PATCH/DELETE /condominiums/:id` | `condominiums:read` / `:write` |
| Buildings | `POST/GET /buildings`, `GET/PATCH/DELETE /buildings/:id` | `buildings:read` / `:write` |
| Apartments | `POST/GET /apartments`, `GET/PATCH/DELETE /apartments/:id` | `apartments:read` / `:write` |
| Persons | `POST/GET /persons`, `GET/PATCH/DELETE /persons/:id` | `persons:read` / `:write` |
| Occupants | `POST/GET /occupants`, `PATCH /occupants/:id/end` | `occupants:read` / `:write` |
| Maintenance | `POST/GET /maintenance-tickets`, `GET/PATCH /:id`, `PATCH /:id/assign`, `PATCH /:id/status` | `maintenance:read` / `:write` |
| Finance | `POST/GET/PATCH /finance/concepts`, `POST/GET /finance/periods`, `POST /finance/periods/:id/generate-charges`, `POST /finance/periods/:id/close`, `GET /finance/charges`, `POST/GET /finance/payments` | `finance:read` / `:write` |
| Reservations | `POST/GET/PATCH /reservations/areas`, `POST/GET /reservations`, `PATCH /reservations/:id/cancel` | `reservations:read` / `:write` |
| Communications | `POST/GET /announcements`, `GET/PATCH /:id`, `PATCH /:id/publish`, `PATCH /:id/archive`, `PATCH /:id/read` | `communications:read` / `:write` |
| Dashboard | `GET /dashboard/summary?condominiumId&periodId` | `dashboard:read` |
| Assets | `POST/GET /assets`, `PATCH /assets/:id` | `assets:read` / `:write` |
| Expenses | `POST/GET /expenses` | `expenses:read` / `:write` |
| Utilities | `POST/GET /utility-readings` | `utilities:read` / `:write` |
| Audit | `GET /audit-logs` | `audit:read` |

Los listados aceptan paginación (`page`, `pageSize`, `search`).

---

## Modelo de datos

### Fase 1 — identidad y estructura

- **organizations** — tenant raíz; ajustes embebidos.
- **users** — email único; `passwordHash` y `refreshTokenHash` con `select:false`;
  `organizationId` nulo para el `SUPER_ADMIN`.
- **condominiums** — `code` único por organización.
- **buildings** — `code` único por condominio.
- **apartments** — con `participationCoefficient`. Los ocupantes actuales **no**
  se embeben.
- **persons** — documento de identidad único por organización.
- **apartmentOccupants** — tabla puente N:M entre apartments y persons, con
  historial (`startDate`/`endDate`/`isPrimary`) para preservar la trazabilidad.
- **roles** / **userRoles** — RBAC; permisos como `string[]` con formato
  `modulo:accion`; asignación con scoping opcional por condominio.
- **auditLogs** — append-only; índice `organizationId + createdAt`.

### Fase 2 — dominios de negocio

- **maintenanceTickets** — tickets/órdenes con ciclo de vida
  (`OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED`, o `CANCELLED`). Las
  transiciones inválidas se rechazan. Historial de cambios embebido.
- **feeConcepts** — conceptos de cobro con método de reparto: `COEFFICIENT`
  (proporcional al coeficiente de participación), `EQUAL` (partes iguales) o
  `FIXED` (monto fijo por departamento).
- **billingPeriods** — periodo mensual por condominio (único por año/mes). Al
  cerrarse se congela con un snapshot agregado (append-only) y no admite más
  cargos.
- **charges** — cargo por departamento/concepto/periodo. Guarda
  `conceptSnapshot` y `calculationSnapshot` para que el histórico sea inmutable
  aunque cambien el concepto o el coeficiente. Único por periodo+depto+concepto.
- **payments** — pagos aplicados a cargos; actualizan el estado del cargo
  (`PENDING → PARTIAL → PAID`) validando el saldo.
- **commonAreas** — áreas comunes reservables (capacidad, tarifa, duración máx.).
- **reservations** — reservas por rango horario con validación de no
  superposición contra otras reservas `CONFIRMED` del mismo área.
- **announcements** — anuncios con audiencia (`CONDOMINIUM`/`BUILDING`/
  `APARTMENT`), estados `DRAFT`/`PUBLISHED`/`ARCHIVED` y recibos de lectura
  embebidos.
- **assets** — activos del condominio (ascensor, bomba, generador…) con estado
  operativo (`OPERATIONAL`/`MAINTENANCE`/`OUT_OF_SERVICE`) y próxima fecha de
  mantenimiento.
- **expenses** — gastos por categoría con año/mes; alimentan la distribución de
  gastos y la serie de ingresos vs gastos del panel.
- **utilityReadings** — lecturas de medidor (agua/luz/gas) por departamento y
  periodo; el consumo se deriva de la diferencia de lecturas.

### Dashboard (agregados)

`GET /dashboard/summary` devuelve indicadores del periodo para un condominio:
cobranza, recaudado, pendiente y tasa de morosidad, número de departamentos,
cargos por estado, mantenimiento por estado, próximas reservas y comunicados
recientes. Se calcula con agregaciones de MongoDB sobre las colecciones de
finanzas, mantenimiento, reservas y comunicaciones (solo lectura).

### Cálculo de cargos por coeficiente

Para un concepto con método `COEFFICIENT` y monto base `M`, el cargo de un
departamento con coeficiente `c` en un condominio cuya suma de coeficientes es
`C` es: `cargo = M * (c / C)`. El coeficiente aplicado y la fórmula se congelan
en el `calculationSnapshot` del cargo.

---

## Notas de despliegue

- Usa una base MongoDB **distinta por entorno**. Nunca la de producción en
  desarrollo.
- El usuario de base de datos debe tener permisos mínimos (no admin del cluster).
- Genera secretos JWT largos, aleatorios y distintos entre sí y por entorno.
- `.env` está en `.gitignore` y no debe versionarse.

## Estado

Fases 1 y 2 completas y compilando (`npm run build` sin errores):

- **Fase 1** — núcleo, auth, RBAC, multi-tenant y estructura.
- **Fase 2** — mantenimiento, finanzas, reservas y comunicaciones.

Próximo: frontend web (Next.js) y app móvil (React Native).
