import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { FeeConcept, FeeConceptDocument } from './schemas/fee-concept.schema';
import { BillingPeriod, BillingPeriodDocument } from './schemas/billing-period.schema';
import { Charge, ChargeDocument } from './schemas/charge.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class FeeConceptRepository extends TenantBaseRepository<FeeConceptDocument> {
  constructor(@InjectModel(FeeConcept.name) model: Model<FeeConceptDocument>) {
    super(model);
  }
}

@Injectable()
export class BillingPeriodRepository extends TenantBaseRepository<BillingPeriodDocument> {
  constructor(@InjectModel(BillingPeriod.name) model: Model<BillingPeriodDocument>) {
    super(model);
  }
}

@Injectable()
export class ChargeRepository extends TenantBaseRepository<ChargeDocument> {
  constructor(@InjectModel(Charge.name) model: Model<ChargeDocument>) {
    super(model);
  }
}

@Injectable()
export class PaymentRepository extends TenantBaseRepository<PaymentDocument> {
  constructor(@InjectModel(Payment.name) model: Model<PaymentDocument>) {
    super(model);
  }
}
