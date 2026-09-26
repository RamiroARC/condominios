import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { Building, BuildingDocument } from './schemas/building.schema';

@Injectable()
export class BuildingsRepository extends TenantBaseRepository<BuildingDocument> {
  constructor(@InjectModel(Building.name) model: Model<BuildingDocument>) {
    super(model);
  }
}
