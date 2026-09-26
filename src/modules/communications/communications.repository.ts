import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';

@Injectable()
export class CommunicationsRepository extends TenantBaseRepository<AnnouncementDocument> {
  constructor(
    @InjectModel(Announcement.name)
    model: Model<AnnouncementDocument>,
  ) {
    super(model);
  }
}
