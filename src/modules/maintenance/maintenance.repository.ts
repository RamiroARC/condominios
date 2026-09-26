import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import {
  MaintenanceTicket,
  MaintenanceTicketDocument,
} from './schemas/maintenance-ticket.schema';

@Injectable()
export class MaintenanceRepository extends TenantBaseRepository<MaintenanceTicketDocument> {
  constructor(
    @InjectModel(MaintenanceTicket.name)
    model: Model<MaintenanceTicketDocument>,
  ) {
    super(model);
  }
}
