import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AnnouncementDocument = HydratedDocument<Announcement>;

export const ANNOUNCEMENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

/** A quién va dirigido el anuncio. */
export const AUDIENCE_TYPES = [
  'CONDOMINIUM', // todos los del condominio
  'BUILDING', // un edificio específico
  'APARTMENT', // un departamento específico
] as const;

/** Marca de lectura de un anuncio por parte de una persona. */
@Schema({ _id: false })
export class ReadReceipt {
  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  personId!: Types.ObjectId;

  @Prop({ default: () => new Date() })
  readAt!: Date;
}
const ReadReceiptSchema = SchemaFactory.createForClass(ReadReceipt);

/**
 * Anuncio / comunicado dirigido a una audiencia dentro de un condominio.
 * El seguimiento de lectura se embebe como recibos (readReceipts).
 */
@Schema({ timestamps: true, collection: 'announcements' })
export class Announcement {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({ enum: AUDIENCE_TYPES, default: 'CONDOMINIUM' })
  audienceType!: string;

  /** Referencia opcional al edificio/depto según audienceType. */
  @Prop({ type: Types.ObjectId, default: null })
  audienceRefId?: Types.ObjectId | null;

  @Prop({ enum: ANNOUNCEMENT_STATUSES, default: 'DRAFT', index: true })
  status!: string;

  @Prop({ default: null })
  publishedAt?: Date | null;

  /** Usuario que crea/publica el anuncio. */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  authorId?: Types.ObjectId | null;

  @Prop({ type: [ReadReceiptSchema], default: [] })
  readReceipts!: ReadReceipt[];
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.index({ organizationId: 1, condominiumId: 1, status: 1, publishedAt: -1 });
