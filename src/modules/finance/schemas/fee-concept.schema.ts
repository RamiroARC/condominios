import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FeeConceptDocument = HydratedDocument<FeeConcept>;

/** Cómo se reparte el monto de un concepto entre los departamentos. */
export const ALLOCATION_METHODS = [
  'COEFFICIENT', // proporcional al coeficiente de participación
  'EQUAL', // partes iguales entre departamentos
  'FIXED', // monto fijo por departamento
] as const;
export type AllocationMethod = (typeof ALLOCATION_METHODS)[number];

/**
 * Concepto de cobro (cuota de mantenimiento, fondo de reserva, extraordinaria…).
 * Define cómo se calcula el cargo, no el monto de un periodo concreto.
 */
@Schema({ timestamps: true, collection: 'feeConcepts' })
export class FeeConcept {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  /**
   * Si está presente, el concepto aplica solo a ese edificio y se reparte entre
   * sus departamentos. Si es null, aplica a todo el condominio.
   */
  @Prop({ type: Types.ObjectId, ref: 'Building', default: null })
  buildingId?: Types.ObjectId | null;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ enum: ALLOCATION_METHODS, default: 'COEFFICIENT' })
  allocationMethod!: string;

  /**
   * Monto base del concepto. Interpretación según allocationMethod:
   * - COEFFICIENT / EQUAL: monto total a repartir en el condominio.
   * - FIXED: monto que se cobra a cada departamento.
   */
  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const FeeConceptSchema = SchemaFactory.createForClass(FeeConcept);

FeeConceptSchema.index({ organizationId: 1, condominiumId: 1, isActive: 1 });
