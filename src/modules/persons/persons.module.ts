import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { PersonsRepository } from './persons.repository';
import { Person, PersonSchema } from './schemas/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }]),
  ],
  controllers: [PersonsController],
  providers: [PersonsService, PersonsRepository],
  exports: [PersonsService],
})
export class PersonsModule {}
