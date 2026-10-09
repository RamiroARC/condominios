import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { AssetsRepository } from './assets.repository';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly repo: AssetsRepository) {}

  create(organizationId: string, dto: CreateAssetDto) {
    return this.repo.create(organizationId, {
      ...dto,
      buildingId: dto.buildingId ? new Types.ObjectId(dto.buildingId) : null,
      nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : null,
      status: 'OPERATIONAL',
    } as never);
  }

  list(organizationId: string, condominiumId: string, buildingId?: string) {
    const filter: Record<string, unknown> = { condominiumId };
    if (buildingId) filter.buildingId = buildingId;
    return this.repo.find(organizationId, filter, { sort: { type: 1, name: 1 } });
  }

  update(organizationId: string, id: string, dto: UpdateAssetDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.nextMaintenanceAt) update.nextMaintenanceAt = new Date(dto.nextMaintenanceAt);
    return this.repo.updateById(organizationId, id, update as never);
  }

  remove(organizationId: string, id: string) {
    return this.repo.deleteById(organizationId, id);
  }
}
