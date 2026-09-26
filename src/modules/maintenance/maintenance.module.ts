import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceRepository } from './maintenance.repository';
import {
  MaintenanceTicket,
  MaintenanceTicketSchema,
} from './schemas/maintenance-ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MaintenanceTicket.name, schema: MaintenanceTicketSchema },
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService, MaintenanceRepository],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
