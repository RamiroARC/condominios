import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import {
  UtilityReading,
  UtilityReadingDocument,
} from './schemas/utility-reading.schema';

@Injectable()
export class UtilitiesRepository extends TenantBaseRepository<UtilityReadingDocument> {
  constructor(
    @InjectModel(UtilityReading.name)
    model: Model<UtilityReadingDocument>,
  ) {
    super(model);
  }
}
