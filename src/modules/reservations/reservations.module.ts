import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import {
  CommonAreaRepository,
  ReservationRepository,
} from './reservations.repositories';
import { CommonArea, CommonAreaSchema } from './schemas/common-area.schema';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommonArea.name, schema: CommonAreaSchema },
      { name: Reservation.name, schema: ReservationSchema },
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, CommonAreaRepository, ReservationRepository],
  exports: [ReservationsService],
})
export class ReservationsModule {}
