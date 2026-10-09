import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  /**
   * Organización a la que pertenece el usuario. Null solo para SUPER_ADMIN
   * (nivel plataforma, no atado a una organización).
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null })
  organizationId!: Types.ObjectId | null;

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  /** Hash de contraseña (argon2). Nunca se serializa al cliente. */
  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ trim: true })
  phone?: string;

  /** Persona vinculada (si el usuario es propietario/residente). */
  @Prop({ type: Types.ObjectId, ref: 'Person', default: null })
  personId!: Types.ObjectId | null;

  @Prop({ enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'], default: 'ACTIVE' })
  status!: string;

  /** Hash del refresh token vigente (rotativo). Nunca se serializa. */
  @Prop({ type: String, select: false, default: null })
  refreshTokenHash?: string | null;

  @Prop({ type: Date, default: null })
  lastLoginAt?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Email único a nivel global (login).
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ organizationId: 1, status: 1 });
