import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MaintenanceTicketDocument = HydratedDocument<MaintenanceTicket>;

export const TICKET_STATUSES = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'CANCELLED',
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export const TICKET_CATEGORIES = [
  'PLUMBING',
  'ELECTRICAL',
  'ELEVATOR',
  'CLEANING',
  'SECURITY',
  'STRUCTURAL',
  'OTHER',
] as const;

/** Entrada del historial de cambios de estado / asignación del ticket. */
@Schema({ _id: false })
export class TicketHistoryEntry {
  @Prop({ required: true })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  changedBy!: Types.ObjectId | null;

  @Prop()
  note?: string;

  @Prop({ default: () => new Date() })
  changedAt!: Date;
}
const TicketHistoryEntrySchema = SchemaFactory.createForClass(TicketHistoryEntry);

/**
 * Ticket / orden de mantenimiento. Scoping por condominio dentro de la
 * organización. El historial de estados se embebe para trazabilidad.
 */
@Schema({ timestamps: true, collection: 'maintenanceTickets' })
export class MaintenanceTicket {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  /**
   * Edificio al que pertenece el ticket (opcional). Si es null, es un ticket a
   * nivel de condominio (áreas comunes generales).
   */
  @Prop({ type: Types.ObjectId, ref: 'Building', default: null })
  buildingId?: Types.ObjectId | null;

  /** Departamento afectado (opcional: puede ser área común). */
  @Prop({ type: Types.ObjectId, ref: 'Apartment', default: null })
  apartmentId?: Types.ObjectId | null;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ enum: TICKET_CATEGORIES, default: 'OTHER' })
  category!: string;

  @Prop({ enum: TICKET_PRIORITIES, default: 'MEDIUM' })
  priority!: string;

  @Prop({ enum: TICKET_STATUSES, default: 'OPEN', index: true })
  status!: string;

  /** Persona que reporta (residente/propietario). */
  @Prop({ type: Types.ObjectId, ref: 'Person', default: null })
  reportedBy?: Types.ObjectId | null;

  /** Usuario/técnico asignado para resolver. */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo?: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  resolvedAt?: Date | null;

  @Prop({ type: [TicketHistoryEntrySchema], default: [] })
  history!: TicketHistoryEntry[];
}

export const MaintenanceTicketSchema =
  SchemaFactory.createForClass(MaintenanceTicket);

MaintenanceTicketSchema.index({ organizationId: 1, condominiumId: 1, status: 1 });
MaintenanceTicketSchema.index({ organizationId: 1, assignedTo: 1 });
MaintenanceTicketSchema.index({ createdAt: -1 });
