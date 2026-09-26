import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BillingPeriodRepository,
  ChargeRepository,
  FeeConceptRepository,
  PaymentRepository,
} from './finance.repositories';
import {
  CreateConceptDto,
  CreatePeriodDto,
  GenerateChargesDto,
  RegisterPaymentDto,
  UpdateConceptDto,
} from './dto/finance.dto';
import { Apartment, ApartmentDocument } from '../apartments/schemas/apartment.schema';
import { Charge, ChargeDocument } from './schemas/charge.schema';
import { AllocationMethod } from './schemas/fee-concept.schema';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class FinanceService {
  constructor(
    private readonly concepts: FeeConceptRepository,
    private readonly periods: BillingPeriodRepository,
    private readonly charges: ChargeRepository,
    private readonly payments: PaymentRepository,
    @InjectModel(Apartment.name)
    private readonly apartmentModel: Model<ApartmentDocument>,
    @InjectModel(Charge.name)
    private readonly chargeModel: Model<ChargeDocument>,
  ) {}

  // ─── Conceptos ────────────────────────────────────────────────────────────

  createConcept(organizationId: string, dto: CreateConceptDto) {
    return this.concepts.create(organizationId, dto as never);
  }

  async listConcepts(organizationId: string, condominiumId: string) {
    return this.concepts.find(organizationId, { condominiumId });
  }

  updateConcept(organizationId: string, id: string, dto: UpdateConceptDto) {
    return this.concepts.updateById(organizationId, id, dto);
  }

  // ─── Periodos ───────────────────────────────────────────────────────────────

  createPeriod(organizationId: string, dto: CreatePeriodDto) {
    return this.periods.create(organizationId, {
      ...dto,
      dueDate: new Date(dto.dueDate),
      status: 'OPEN',
    } as never);
  }

  listPeriods(organizationId: string, condominiumId: string) {
    return this.periods.find(
      organizationId,
      { condominiumId },
      { sort: { year: -1, month: -1 } },
    );
  }

  /**
   * Genera los cargos de un periodo aplicando los conceptos a cada departamento
   * activo del condominio. El monto se calcula según el método de reparto y se
   * congela en snapshots (inmutabilidad financiera).
   */
  async generateCharges(
    organizationId: string,
    periodId: string,
    dto: GenerateChargesDto,
  ) {
    const period = await this.periods.findByIdOrFail(organizationId, periodId);
    if (period.status === 'CLOSED') {
      throw new BadRequestException('El periodo está cerrado; no admite cargos');
    }

    const condominiumId = String(period.condominiumId);

    const conceptFilter: Record<string, unknown> = { condominiumId, isActive: true };
    if (dto.conceptIds?.length) {
      conceptFilter._id = { $in: dto.conceptIds.map((id) => new Types.ObjectId(id)) };
    }
    const concepts = await this.concepts.find(organizationId, conceptFilter);
    if (!concepts.length) {
      throw new BadRequestException('No hay conceptos activos para generar cargos');
    }

    const apartments = await this.apartmentModel
      .find({
        organizationId: new Types.ObjectId(organizationId),
        condominiumId: period.condominiumId,
        status: 'ACTIVE',
      })
      .exec();
    if (!apartments.length) {
      throw new BadRequestException('El condominio no tiene departamentos activos');
    }

    const totalCoefficient = apartments.reduce(
      (sum, a) => sum + (a.participationCoefficient || 0),
      0,
    );

    const created: unknown[] = [];
    for (const concept of concepts) {
      for (const apt of apartments) {
        const { amount, formula, coefficient } = this.computeAmount(
          concept.allocationMethod as AllocationMethod,
          concept.amount,
          apt.participationCoefficient || 0,
          totalCoefficient,
          apartments.length,
        );
        if (amount <= 0) continue;

        // upsert idempotente: no duplica si ya existe el cargo de ese concepto/depto/periodo.
        const doc = await this.chargeModel.findOneAndUpdate(
          {
            organizationId: new Types.ObjectId(organizationId),
            periodId: period._id,
            apartmentId: apt._id,
            conceptId: concept._id,
          },
          {
            $setOnInsert: {
              organizationId: new Types.ObjectId(organizationId),
              condominiumId: period.condominiumId,
              periodId: period._id,
              apartmentId: apt._id,
              conceptId: concept._id,
              conceptSnapshot: {
                name: concept.name,
                allocationMethod: concept.allocationMethod,
                baseAmount: concept.amount,
              },
              calculationSnapshot: {
                method: concept.allocationMethod,
                participationCoefficient: coefficient,
                apartmentsCount: apartments.length,
                formula,
              },
              amount,
              paidAmount: 0,
              status: 'PENDING',
            },
          },
          { new: true, upsert: true },
        );
        created.push(doc);
      }
    }

    return { periodId, generated: created.length };
  }

  private computeAmount(
    method: AllocationMethod,
    baseAmount: number,
    coefficient: number,
    totalCoefficient: number,
    apartmentsCount: number,
  ): { amount: number; formula: string; coefficient: number } {
    switch (method) {
      case 'COEFFICIENT': {
        const ratio = totalCoefficient > 0 ? coefficient / totalCoefficient : 0;
        return {
          amount: this.round(baseAmount * ratio),
          formula: `${baseAmount} * (${coefficient} / ${totalCoefficient})`,
          coefficient,
        };
      }
      case 'EQUAL':
        return {
          amount: this.round(apartmentsCount > 0 ? baseAmount / apartmentsCount : 0),
          formula: `${baseAmount} / ${apartmentsCount}`,
          coefficient,
        };
      case 'FIXED':
      default:
        return { amount: this.round(baseAmount), formula: `${baseAmount}`, coefficient };
    }
  }

  private round(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  /**
   * Cierra el periodo: calcula el snapshot agregado (append-only) y lo bloquea.
   */
  async closePeriod(organizationId: string, periodId: string) {
    const period = await this.periods.findByIdOrFail(organizationId, periodId);
    if (period.status === 'CLOSED') {
      throw new BadRequestException('El periodo ya está cerrado');
    }

    const charges = await this.charges.find(organizationId, { periodId });
    const totalCharged = charges.reduce((s, c) => s + c.amount, 0);
    const totalPaid = charges.reduce((s, c) => s + c.paidAmount, 0);
    const byConcept: Record<string, number> = {};
    for (const c of charges) {
      const key = c.conceptSnapshot?.name ?? String(c.conceptId);
      byConcept[key] = this.round((byConcept[key] ?? 0) + c.amount);
    }

    return this.periods.updateById(organizationId, periodId, {
      status: 'CLOSED',
      closedAt: new Date(),
      snapshot: {
        totalCharged: this.round(totalCharged),
        totalPaid: this.round(totalPaid),
        chargesCount: charges.length,
        byConcept,
        takenAt: new Date(),
      },
    } as never);
  }

  // ─── Cargos ───────────────────────────────────────────────────────────────

  async listCharges(
    organizationId: string,
    filters: { periodId?: string; apartmentId?: string; status?: string },
    query: PaginationQueryDto,
  ) {
    const filter: Record<string, unknown> = {};
    if (filters.periodId) filter.periodId = filters.periodId;
    if (filters.apartmentId) filter.apartmentId = filters.apartmentId;
    if (filters.status) filter.status = filters.status;
    const { items, total } = await this.charges.paginate(
      organizationId,
      filter,
      query.page,
      query.pageSize,
    );
    return buildPaginatedResult(items, total, query.page, query.pageSize);
  }

  // ─── Pagos ──────────────────────────────────────────────────────────────────

  /**
   * Registra un pago y actualiza el estado del cargo (PENDING → PARTIAL → PAID).
   */
  async registerPayment(
    organizationId: string,
    userId: string,
    dto: RegisterPaymentDto,
  ) {
    const charge = await this.charges.findByIdOrFail(organizationId, dto.chargeId);
    if (charge.status === 'CANCELLED') {
      throw new BadRequestException('No se puede pagar un cargo cancelado');
    }

    const newPaid = this.round(charge.paidAmount + dto.amount);
    if (newPaid > charge.amount) {
      throw new BadRequestException(
        `El pago excede el saldo pendiente (${charge.amount - charge.paidAmount})`,
      );
    }

    const payment = await this.payments.create(organizationId, {
      condominiumId: charge.condominiumId,
      chargeId: charge._id,
      apartmentId: charge.apartmentId,
      amount: dto.amount,
      method: dto.method ?? 'TRANSFER',
      paidAt: new Date(dto.paidAt),
      reference: dto.reference,
      registeredBy: new Types.ObjectId(userId),
    } as never);

    const status = newPaid >= charge.amount ? 'PAID' : 'PARTIAL';
    await this.charges.updateById(organizationId, dto.chargeId, {
      paidAmount: newPaid,
      status,
    });

    return payment;
  }

  async listPayments(organizationId: string, chargeId: string) {
    if (!chargeId) throw new NotFoundException('chargeId requerido');
    return this.payments.find(organizationId, { chargeId });
  }
}
