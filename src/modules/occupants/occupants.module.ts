import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OccupantsController } from './occupants.controller';
import { OccupantsService } from './occupants.service';
import { OccupantsRepository } from './occupants.repository';
import {
  ApartmentOccupant,
  ApartmentOccupantSchema,
} from './schemas/apartment-occupant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApartmentOccupant.name, schema: ApartmentOccupantSchema },
    ]),
  ],
  controllers: [OccupantsController],
  providers: [OccupantsService, OccupantsRepository],
  exports: [OccupantsService],
})
export class OccupantsModule {}
