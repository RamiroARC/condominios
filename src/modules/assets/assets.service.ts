import { Injectable } from '@nestjs/common';
import { AssetsRepository } from './assets.repository';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly repo: AssetsRepository) {}

  create(organizationId: string, dto: CreateAssetDto) {
    return this.repo.create(organizationId, {
      ...dto,
      nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : null,
      status: 'OPERATIONAL',
    } as never);
  }

  list(organizationId: string, condominiumId: string) {
    return this.repo.find(organizationId, { condominiumId }, { sort: { type: 1, name: 1 } });
  }

  update(organizationId: string, id: string, dto: UpdateAssetDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.nextMaintenanceAt) update.nextMaintenanceAt = new Date(dto.nextMaintenanceAt);
    return this.repo.updateById(organizationId, id, update as never);
  }
}
