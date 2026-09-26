import { Injectable } from '@nestjs/common';
import { PersonsRepository } from './persons.repository';
import { CreatePersonDto, UpdatePersonDto } from './dto/person.dto';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PersonsService {
  constructor(private readonly repo: PersonsRepository) {}

  create(organizationId: string, dto: CreatePersonDto) {
    return this.repo.create(organizationId, dto);
  }

  async list(organizationId: string, query: PaginationQueryDto) {
    const filter = query.search
      ? {
          $or: [
            { firstName: { $regex: query.search, $options: 'i' } },
            { lastName: { $regex: query.search, $options: 'i' } },
            { documentNumber: { $regex: query.search, $options: 'i' } },
          ],
        }
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

  update(organizationId: string, id: string, dto: UpdatePersonDto) {
    return this.repo.updateById(organizationId, id, dto);
  }

  remove(organizationId: string, id: string) {
    return this.repo.deleteById(organizationId, id);
  }
}
