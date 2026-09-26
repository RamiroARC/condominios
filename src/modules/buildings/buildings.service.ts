import { Injectable } from '@nestjs/common';
import { BuildingsRepository } from './buildings.repository';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BuildingsService {
  constructor(private readonly repo: BuildingsRepository) {}

  create(organizationId: string, dto: CreateBuildingDto) {
    // Cast: Mongoose castea string -> ObjectId en runtime; el tipo del DTO usa string.
    return this.repo.create(organizationId, dto as never);
  }

  async list(organizationId: string, condominiumId: string, query: PaginationQueryDto) {
    const filter: Record<string, unknown> = { condominiumId };
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    const { items, total } = await this.repo.paginate(
      organizationId,
      filter,
      query.page,
      query.pageSize,
    );
    return buildPaginatedResult(items, total, query.page, query.pageSize);
  }

  findOne(organizationId: string, id: string) {
    return this.repo.findByIdOrFail(organizationId, id);
  }

  update(organizationId: string, id: string, dto: UpdateBuildingDto) {
    return this.repo.updateById(organizationId, id, dto);
  }

  remove(organizationId: string, id: string) {
    return this.repo.deleteById(organizationId, id);
  }
}
