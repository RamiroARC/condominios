import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import {
  BillingPeriodRepository,
  ChargeRepository,
  FeeConceptRepository,
  PaymentRepository,
} from './finance.repositories';
import { FeeConcept, FeeConceptSchema } from './schemas/fee-concept.schema';
import { BillingPeriod, BillingPeriodSchema } from './schemas/billing-period.schema';
import { Charge, ChargeSchema } from './schemas/charge.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Apartment, ApartmentSchema } from '../apartments/schemas/apartment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeeConcept.name, schema: FeeConceptSchema },
      { name: BillingPeriod.name, schema: BillingPeriodSchema },
      { name: Charge.name, schema: ChargeSchema },
      { name: Payment.name, schema: PaymentSchema },
      // Necesario para el cálculo de cargos por coeficiente.
      { name: Apartment.name, schema: ApartmentSchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [
    FinanceService,
    FeeConceptRepository,
    BillingPeriodRepository,
    ChargeRepository,
    PaymentRepository,
  ],
  exports: [FinanceService],
})
export class FinanceModule {}
