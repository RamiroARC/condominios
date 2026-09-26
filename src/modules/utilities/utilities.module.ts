import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilitiesController } from './utilities.controller';
import { UtilitiesService } from './utilities.service';
import { UtilitiesRepository } from './utilities.repository';
import { UtilityReading, UtilityReadingSchema } from './schemas/utility-reading.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UtilityReading.name, schema: UtilityReadingSchema },
    ]),
  ],
  controllers: [UtilitiesController],
  providers: [UtilitiesService, UtilitiesRepository],
  exports: [UtilitiesService],
})
export class UtilitiesModule {}
