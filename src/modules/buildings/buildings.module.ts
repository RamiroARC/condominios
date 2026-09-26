import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { BuildingsRepository } from './buildings.repository';
import { Building, BuildingSchema } from './schemas/building.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Building.name, schema: BuildingSchema }]),
  ],
  controllers: [BuildingsController],
  providers: [BuildingsService, BuildingsRepository],
  exports: [BuildingsService],
})
export class BuildingsModule {}
