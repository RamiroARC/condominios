import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommonAreaDocument = HydratedDocument<CommonArea>;

/**
 * Área común reservable (salón de eventos, quincho, cancha, etc.).
 */
@Schema({ timestamps: true, collection: 'commonAreas' })
export class CommonArea {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ default: 0, min: 0 })
  capacity!: number;

  /** Costo de reserva (0 = gratuito). */
  @Prop({ default: 0, min: 0 })
  reservationFee!: number;

  /** Duración máxima de una reserva en minutos (0 = sin límite). */
  @Prop({ default: 0, min: 0 })
  maxDurationMinutes!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const CommonAreaSchema = SchemaFactory.createForClass(CommonArea);

CommonAreaSchema.index({ organizationId: 1, condominiumId: 1, isActive: 1 });
