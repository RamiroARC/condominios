import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { CommonArea, CommonAreaDocument } from './schemas/common-area.schema';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';

@Injectable()
export class CommonAreaRepository extends TenantBaseRepository<CommonAreaDocument> {
  constructor(@InjectModel(CommonArea.name) model: Model<CommonAreaDocument>) {
    super(model);
  }
}

@Injectable()
export class ReservationRepository extends TenantBaseRepository<ReservationDocument> {
  constructor(@InjectModel(Reservation.name) model: Model<ReservationDocument>) {
    super(model);
  }
}
