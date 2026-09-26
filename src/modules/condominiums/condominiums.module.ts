import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CondominiumsController } from './condominiums.controller';
import { CondominiumsService } from './condominiums.service';
import { CondominiumsRepository } from './condominiums.repository';
import { Condominium, CondominiumSchema } from './schemas/condominium.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condominium.name, schema: CondominiumSchema },
    ]),
  ],
  controllers: [CondominiumsController],
  providers: [CondominiumsService, CondominiumsRepository],
  exports: [CondominiumsService],
})
export class CondominiumsModule {}
