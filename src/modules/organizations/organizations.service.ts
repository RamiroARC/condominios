import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';

/**
 * Organizations es una colección de nivel PLATAFORMA (no multi-tenant scoped):
 * la gestiona el SUPER_ADMIN. Por eso NO hereda TenantBaseRepository ni filtra
 * por organizationId — opera sobre todas las organizaciones.
 */
@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private readonly model: Model<OrganizationDocument>,
  ) {}

  create(dto: CreateOrganizationDto) {
    return new this.model(dto).save();
  }

  async list(query: PaginationQueryDto) {
    const filter = query.search
      ? { name: { $regex: query.search, $options: 'i' } }
      : {};
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return buildPaginatedResult(items, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Organización no encontrada');
    return doc;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Organización no encontrada');
    return doc;
  }
}
