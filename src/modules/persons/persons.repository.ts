import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { Person, PersonDocument } from './schemas/person.schema';

@Injectable()
export class PersonsRepository extends TenantBaseRepository<PersonDocument> {
  constructor(@InjectModel(Person.name) model: Model<PersonDocument>) {
    super(model);
  }
}
