import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import {
  ApartmentOccupant,
  ApartmentOccupantDocument,
} from './schemas/apartment-occupant.schema';

@Injectable()
export class OccupantsRepository extends TenantBaseRepository<ApartmentOccupantDocument> {
  constructor(
    @InjectModel(ApartmentOccupant.name)
    model: Model<ApartmentOccupantDocument>,
  ) {
    super(model);
  }
}
