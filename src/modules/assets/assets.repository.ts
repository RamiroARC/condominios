import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { Asset, AssetDocument } from './schemas/asset.schema';

@Injectable()
export class AssetsRepository extends TenantBaseRepository<AssetDocument> {
  constructor(@InjectModel(Asset.name) model: Model<AssetDocument>) {
    super(model);
  }
}
