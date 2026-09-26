import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrganizationDocument = HydratedDocument<Organization>;

/** Configuración regional/operativa embebida (se lee siempre con la organización). */
@Schema({ _id: false })
export class OrganizationSettings {
  @Prop({ default: 'PEN' })
  currency!: string;

  @Prop({ default: 'America/Lima' })
  timezone!: string;

  @Prop({ default: 'es-PE' })
  locale!: string;

  @Prop({ type: Object, default: {} })
  numbering!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  notifications!: Record<string, unknown>;
}

@Schema({ timestamps: true, collection: 'organizations' })
export class Organization {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  legalName?: string;

  @Prop({ trim: true })
  taxId?: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ enum: ['ACTIVE', 'SUSPENDED', 'INACTIVE'], default: 'ACTIVE' })
  status!: string;

  @Prop({ type: OrganizationSettings, default: () => ({}) })
  settings!: OrganizationSettings;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

OrganizationSchema.index({ taxId: 1 }, { sparse: true });
OrganizationSchema.index({ status: 1 });
