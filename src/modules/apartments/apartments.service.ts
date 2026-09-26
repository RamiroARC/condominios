import { Injectable } from '@nestjs/common';
import { ApartmentsRepository } from './apartments.repository';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ApartmentsService {
  constructor(private readonly repo: ApartmentsRepository) {}

  create(organizationId: string, dto: CreateApartmentDto) {
    // Cast: Mongoose castea string -> ObjectId en runtime; el tipo del DTO usa string.
    return this.repo.create(organizationId, dto as never);
  }

  async list(organizationId: string, buildingId: string, query: PaginationQueryDto) {
    const filter: Record<string, unknown> = {};
    if (buildingId) filter.buildingId = buildingId;
    if (query.search) filter.code = { $regex: query.search, $options: 'i' };
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

  update(organizationId: string, id: string, dto: UpdateApartmentDto) {
    return this.repo.updateById(organizationId, id, dto);
  }

  remove(organizationId: string, id: string) {
    return this.repo.deleteById(organizationId, id);
  }
}
