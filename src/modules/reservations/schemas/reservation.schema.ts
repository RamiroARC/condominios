import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

export const RESERVATION_STATUSES = [
  'CONFIRMED',
  'CANCELLED',
] as const;

/**
 * Reserva de un área común en un rango horario. La no superposición se valida
 * en el servicio contra otras reservas CONFIRMED del mismo área.
 */
@Schema({ timestamps: true, collection: 'reservations' })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CommonArea', required: true, index: true })
  commonAreaId!: Types.ObjectId;

  /** Departamento que reserva. */
  @Prop({ type: Types.ObjectId, ref: 'Apartment', required: true })
  apartmentId!: Types.ObjectId;

  /** Persona que hace la reserva. */
  @Prop({ type: Types.ObjectId, ref: 'Person', default: null })
  personId?: Types.ObjectId | null;

  @Prop({ required: true })
  startAt!: Date;

  @Prop({ required: true })
  endAt!: Date;

  @Prop({ enum: RESERVATION_STATUSES, default: 'CONFIRMED', index: true })
  status!: string;

  @Prop({ type: Date, default: null })
  cancelledAt?: Date | null;

  @Prop()
  notes?: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Consulta de solapamiento por área y rango.
ReservationSchema.index({ organizationId: 1, commonAreaId: 1, status: 1, startAt: 1 });
