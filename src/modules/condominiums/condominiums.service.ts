import { Injectable } from '@nestjs/common';
import { CondominiumsRepository } from './condominiums.repository';
import { CreateCondominiumDto, UpdateCondominiumDto } from './dto/condominium.dto';
import {
  buildPaginatedResult,
  PaginationQueryDto,
} from '../../common/dto/pagination.dto';

@Injectable()
export class CondominiumsService {
  constructor(private readonly repo: CondominiumsRepository) {}

  create(organizationId: string, dto: CreateCondominiumDto) {
    return this.repo.create(organizationId, dto);
  }

  async list(organizationId: string, query: PaginationQueryDto) {
    const filter = query.search
      ? { name: { $regex: query.search, $options: 'i' } }
      : {};
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

  update(organizationId: string, id: string, dto: UpdateCondominiumDto) {
    return this.repo.updateById(organizationId, id, dto);
  }

  remove(organizationId: string, id: string) {
    return this.repo.deleteById(organizationId, id);
  }
}
