import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApartmentsController } from './apartments.controller';
import { ApartmentsService } from './apartments.service';
import { ApartmentsRepository } from './apartments.repository';
import { Apartment, ApartmentSchema } from './schemas/apartment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Apartment.name, schema: ApartmentSchema }]),
  ],
  controllers: [ApartmentsController],
  providers: [ApartmentsService, ApartmentsRepository],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
