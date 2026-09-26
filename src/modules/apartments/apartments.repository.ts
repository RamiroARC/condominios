import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { Apartment, ApartmentDocument } from './schemas/apartment.schema';

@Injectable()
export class ApartmentsRepository extends TenantBaseRepository<ApartmentDocument> {
  constructor(@InjectModel(Apartment.name) model: Model<ApartmentDocument>) {
    super(model);
  }
}
