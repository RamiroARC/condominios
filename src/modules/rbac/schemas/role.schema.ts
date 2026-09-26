import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

/**
 * Rol con lista de permisos (formato "modulo:accion").
 * Los roles se configuran, no se hardcodean: se pueden crear nuevos sin redeploy.
 * organizationId null = rol de plataforma (ej. SUPER_ADMIN).
 */
@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null, index: true })
  organizationId!: Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  key!: string; // ej. ORGANIZATION_ADMIN, ACCOUNTANT

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  /** Permisos concedidos por este rol. Ej: ["payments:create", "periods:close"]. */
  @Prop({ type: [String], default: [] })
  permissions!: string[];

  /** true = rol del sistema, no editable/eliminable por usuarios. */
  @Prop({ default: false })
  isSystem!: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ organizationId: 1, key: 1 }, { unique: true });
