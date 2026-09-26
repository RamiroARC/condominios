import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserRoleDocument = HydratedDocument<UserRole>;

/**
 * Asignación de un rol a un usuario, opcionalmente acotada a un condominio.
 * Un usuario puede tener varios roles (ej. ACCOUNTANT en dos condominios).
 */
@Schema({ timestamps: true, collection: 'userRoles' })
export class UserRole {
  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null, index: true })
  organizationId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId!: Types.ObjectId;

  /** Scoping opcional: si está presente, el rol solo aplica a este condominio. */
  @Prop({ type: Types.ObjectId, ref: 'Condominium', default: null })
  condominiumId!: Types.ObjectId | null;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);

UserRoleSchema.index({ userId: 1 });
UserRoleSchema.index({ userId: 1, roleId: 1, condominiumId: 1 }, { unique: true });
