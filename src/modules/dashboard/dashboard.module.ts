import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Charge, ChargeSchema } from '../finance/schemas/charge.schema';
import { Payment, PaymentSchema } from '../finance/schemas/payment.schema';
import { BillingPeriod, BillingPeriodSchema } from '../finance/schemas/billing-period.schema';
import { Apartment, ApartmentSchema } from '../apartments/schemas/apartment.schema';
import {
  MaintenanceTicket,
  MaintenanceTicketSchema,
} from '../maintenance/schemas/maintenance-ticket.schema';
import { Reservation, ReservationSchema } from '../reservations/schemas/reservation.schema';
import { Announcement, AnnouncementSchema } from '../communications/schemas/announcement.schema';
import { Asset, AssetSchema } from '../assets/schemas/asset.schema';
import { Expense, ExpenseSchema } from '../expenses/schemas/expense.schema';
import { UtilityReading, UtilityReadingSchema } from '../utilities/schemas/utility-reading.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Charge.name, schema: ChargeSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: BillingPeriod.name, schema: BillingPeriodSchema },
      { name: Apartment.name, schema: ApartmentSchema },
      { name: MaintenanceTicket.name, schema: MaintenanceTicketSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Announcement.name, schema: AnnouncementSchema },
      { name: Asset.name, schema: AssetSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: UtilityReading.name, schema: UtilityReadingSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
