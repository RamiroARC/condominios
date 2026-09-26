import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { Condominium, CondominiumDocument } from './schemas/condominium.schema';

/** Acceso a datos de condominios. Hereda el filtro obligatorio de organizationId. */
@Injectable()
export class CondominiumsRepository extends TenantBaseRepository<CondominiumDocument> {
  constructor(
    @InjectModel(Condominium.name) model: Model<CondominiumDocument>,
  ) {
    super(model);
  }
}
