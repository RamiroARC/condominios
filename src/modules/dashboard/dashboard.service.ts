import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Charge, ChargeDocument } from '../finance/schemas/charge.schema';
import { Payment, PaymentDocument } from '../finance/schemas/payment.schema';
import {
  BillingPeriod,
  BillingPeriodDocument,
} from '../finance/schemas/billing-period.schema';
import { Apartment, ApartmentDocument } from '../apartments/schemas/apartment.schema';
import {
  MaintenanceTicket,
  MaintenanceTicketDocument,
} from '../maintenance/schemas/maintenance-ticket.schema';
import {
  Reservation,
  ReservationDocument,
} from '../reservations/schemas/reservation.schema';
import {
  Announcement,
  AnnouncementDocument,
} from '../communications/schemas/announcement.schema';
import { Asset, AssetDocument } from '../assets/schemas/asset.schema';
import { Expense, ExpenseDocument } from '../expenses/schemas/expense.schema';
import {
  UtilityReading,
  UtilityReadingDocument,
} from '../utilities/schemas/utility-reading.schema';

export interface DashboardSummary {
  period: { id: string; year: number; month: number; status: string } | null;
  kpis: {
    charged: number;
    collected: number;
    pending: number;
    delinquencyRate: number; // % de morosidad (pendiente / cargado)
    apartments: number;
  };
  chargesByStatus: { status: string; count: number; amount: number }[];
  maintenanceByStatus: { status: string; count: number }[];
  upcomingReservations: {
    id: string;
    commonAreaId: string;
    startAt: Date;
    endAt: Date;
    status: string;
  }[];
  recentAnnouncements: {
    id: string;
    title: string;
    status: string;
    publishedAt: Date | null;
  }[];
  expensesByCategory: { category: string; amount: number }[];
  incomeVsExpenses: { year: number; month: number; income: number; expenses: number }[];
  waterConsumption: {
    apartmentId: string;
    previousReading: number;
    currentReading: number;
    consumption: number;
  }[];
  assets: {
    id: string;
    name: string;
    type: string;
    status: string;
    nextMaintenanceAt: Date | null;
  }[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Charge.name) private readonly chargeModel: Model<ChargeDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(BillingPeriod.name)
    private readonly periodModel: Model<BillingPeriodDocument>,
    @InjectModel(Apartment.name)
    private readonly apartmentModel: Model<ApartmentDocument>,
    @InjectModel(MaintenanceTicket.name)
    private readonly ticketModel: Model<MaintenanceTicketDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
    @InjectModel(Expense.name) private readonly expenseModel: Model<ExpenseDocument>,
    @InjectModel(UtilityReading.name)
    private readonly utilityModel: Model<UtilityReadingDocument>,
  ) {}

  async summary(
    organizationId: string,
    condominiumId: string,
    periodId?: string,
    buildingId?: string,
  ): Promise<DashboardSummary> {
    const orgId = new Types.ObjectId(organizationId);
    const condoId = new Types.ObjectId(condominiumId);
    const bId = buildingId ? new Types.ObjectId(buildingId) : null;

    // Periodo: el indicado o el más reciente del condominio.
    const period = periodId
      ? await this.periodModel.findOne({ _id: periodId, organizationId: orgId }).exec()
      : await this.periodModel
          .findOne({ organizationId: orgId, condominiumId: condoId })
          .sort({ year: -1, month: -1 })
          .exec();

    // Ventana de 6 meses para la serie ingresos vs gastos.
    const now = new Date();
    const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startYear = windowStart.getFullYear();
    const startMonth = windowStart.getMonth() + 1;

    const [
      apartments,
      chargeAgg,
      maintenanceAgg,
      reservations,
      announcements,
      expenseByCat,
      expenseSeries,
      paymentSeries,
      water,
      assets,
    ] =
      await Promise.all([
        this.apartmentModel.countDocuments({
          organizationId: orgId,
          condominiumId: condoId,
          status: 'ACTIVE',
        }),
        period
          ? this.chargeModel
              .aggregate<{ _id: string; count: number; amount: number; paid: number }>([
                {
                  $match: {
                    organizationId: orgId,
                    periodId: period._id,
                  },
                },
                {
                  $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' },
                    paid: { $sum: '$paidAmount' },
                  },
                },
              ])
              .exec()
          : Promise.resolve([]),
        this.ticketModel
          .aggregate<{ _id: string; count: number }>([
            {
              $match: {
                organizationId: orgId,
                condominiumId: condoId,
                ...(bId ? { buildingId: bId } : {}),
              },
            },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ])
          .exec(),
        this.reservationModel
          .find({
            organizationId: orgId,
            condominiumId: condoId,
            status: 'CONFIRMED',
            endAt: { $gte: new Date() },
          })
          .sort({ startAt: 1 })
          .limit(8)
          .exec(),
        this.announcementModel
          .find({ organizationId: orgId, condominiumId: condoId })
          .sort({ publishedAt: -1, createdAt: -1 })
          .limit(5)
          .exec(),
        // Distribución de gastos por categoría (todo el histórico del condominio).
        this.expenseModel
          .aggregate<{ _id: string; amount: number }>([
            { $match: { organizationId: orgId, condominiumId: condoId } },
            { $group: { _id: '$category', amount: { $sum: '$amount' } } },
          ])
          .exec(),
        // Gastos por mes en la ventana de 6 meses.
        this.expenseModel
          .aggregate<{ _id: { year: number; month: number }; amount: number }>([
            {
              $match: {
                organizationId: orgId,
                condominiumId: condoId,
                $or: [
                  { year: { $gt: startYear } },
                  { year: startYear, month: { $gte: startMonth } },
                ],
              },
            },
            {
              $group: {
                _id: { year: '$year', month: '$month' },
                amount: { $sum: '$amount' },
              },
            },
          ])
          .exec(),
        // Ingresos (pagos) por mes en la misma ventana.
        this.paymentModel
          .aggregate<{ _id: { year: number; month: number }; amount: number }>([
            {
              $match: {
                organizationId: orgId,
                condominiumId: condoId,
                paidAt: { $gte: windowStart },
              },
            },
            {
              $group: {
                _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
                amount: { $sum: '$amount' },
              },
            },
          ])
          .exec(),
        // Consumo de agua más reciente por departamento.
        this.utilityModel
          .find({ organizationId: orgId, condominiumId: condoId, utilityType: 'WATER' })
          .sort({ year: -1, month: -1 })
          .limit(10)
          .exec(),
        // Activos y su estado (filtrados por edificio si se indica).
        this.assetModel
          .find({
            organizationId: orgId,
            condominiumId: condoId,
            ...(bId ? { buildingId: bId } : {}),
          })
          .sort({ type: 1, name: 1 })
          .exec(),
      ]);

    const charged = chargeAgg.reduce((s, c) => s + c.amount, 0);
    const collected = chargeAgg.reduce((s, c) => s + c.paid, 0);
    const pending = this.round(charged - collected);
    const delinquencyRate = charged > 0 ? this.round((pending / charged) * 100) : 0;

    // Combina ingresos y gastos por mes en la ventana de 6 meses.
    const seriesMap = new Map<string, { year: number; month: number; income: number; expenses: number }>();
    const keyOf = (y: number, m: number) => `${y}-${m}`;
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      seriesMap.set(keyOf(y, m), { year: y, month: m, income: 0, expenses: 0 });
    }
    for (const p of paymentSeries) {
      const entry = seriesMap.get(keyOf(p._id.year, p._id.month));
      if (entry) entry.income = this.round(p.amount);
    }
    for (const e of expenseSeries) {
      const entry = seriesMap.get(keyOf(e._id.year, e._id.month));
      if (entry) entry.expenses = this.round(e.amount);
    }
    const incomeVsExpenses = [...seriesMap.values()];

    return {
      period: period
        ? {
            id: String(period._id),
            year: period.year,
            month: period.month,
            status: period.status,
          }
        : null,
      kpis: {
        charged: this.round(charged),
        collected: this.round(collected),
        pending,
        delinquencyRate,
        apartments,
      },
      chargesByStatus: chargeAgg.map((c) => ({
        status: c._id,
        count: c.count,
        amount: this.round(c.amount),
      })),
      maintenanceByStatus: maintenanceAgg.map((m) => ({
        status: m._id,
        count: m.count,
      })),
      upcomingReservations: reservations.map((r) => ({
        id: String(r._id),
        commonAreaId: String(r.commonAreaId),
        startAt: r.startAt,
        endAt: r.endAt,
        status: r.status,
      })),
      recentAnnouncements: announcements.map((a) => ({
        id: String(a._id),
        title: a.title,
        status: a.status,
        publishedAt: a.publishedAt ?? null,
      })),
      expensesByCategory: expenseByCat.map((e) => ({
        category: e._id,
        amount: this.round(e.amount),
      })),
      incomeVsExpenses,
      waterConsumption: water.map((w) => ({
        apartmentId: String(w.apartmentId),
        previousReading: w.previousReading,
        currentReading: w.currentReading,
        consumption: w.consumption,
      })),
      assets: assets.map((a) => ({
        id: String(a._id),
        name: a.name,
        type: a.type,
        status: a.status,
        nextMaintenanceAt: a.nextMaintenanceAt ?? null,
      })),
    };
  }

  private round(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }
}
