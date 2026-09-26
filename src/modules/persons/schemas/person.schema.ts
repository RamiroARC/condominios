import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

/**
 * Persona reutilizable (propietario, residente, inquilino, contacto).
 * Colección independiente para NO duplicar datos si participa en varios procesos.
 */
@Schema({ timestamps: true, collection: 'persons' })
export class Person {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ enum: ['DNI', 'CE', 'PASSPORT', 'RUC', 'OTHER'], default: 'DNI' })
  documentType!: string;

  @Prop({ required: true, trim: true })
  documentNumber!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ trim: true, lowercase: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status!: string;
}

export const PersonSchema = SchemaFactory.createForClass(Person);

// Evita personas duplicadas dentro de una organización.
PersonSchema.index(
  { organizationId: 1, documentType: 1, documentNumber: 1 },
  { unique: true },
);
