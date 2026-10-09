import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommunicationsRepository } from './communications.repository';
import { Announcement, AnnouncementDocument } from './schemas/announcement.schema';
import {
  CreateAnnouncementDto,
  MarkReadDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CommunicationsService {
  constructor(
    private readonly repo: CommunicationsRepository,
    @InjectModel(Announcement.name)
    private readonly model: Model<AnnouncementDocument>,
  ) {}

  create(organizationId: string, authorId: string, dto: CreateAnnouncementDto) {
    return this.repo.create(organizationId, {
      ...dto,
      status: 'DRAFT',
      authorId: new Types.ObjectId(authorId),
    } as never);
  }

  async list(
    organizationId: string,
    filters: { condominiumId?: string; status?: string },
    query: PaginationQueryDto,
  ) {
    const filter: Record<string, unknown> = {};
    if (filters.condominiumId) filter.condominiumId = filters.condominiumId;
    if (filters.status) filter.status = filters.status;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    const { items, total } = await this.repo.paginate(
      organizationId,
      filter,
      query.page,
      query.pageSize,
      { publishedAt: -1, createdAt: -1 },
    );
    return buildPaginatedResult(items, total, query.page, query.pageSize);
  }

  findOne(organizationId: string, id: string) {
    return this.repo.findByIdOrFail(organizationId, id);
  }

  update(organizationId: string, id: string, dto: UpdateAnnouncementDto) {
    return this.repo.updateById(organizationId, id, dto);
  }

  async publish(organizationId: string, id: string) {
    const announcement = await this.repo.findByIdOrFail(organizationId, id);
    if (announcement.status === 'PUBLISHED') {
      throw new BadRequestException('El anuncio ya está publicado');
    }
    if (announcement.status === 'ARCHIVED') {
      throw new BadRequestException('No se puede publicar un anuncio archivado');
    }
    return this.repo.updateById(organizationId, id, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });
  }

  async archive(organizationId: string, id: string) {
    return this.repo.updateById(organizationId, id, { status: 'ARCHIVED' });
  }

  remove(organizationId: string, id: string) {
    return this.repo.deleteById(organizationId, id);
  }

  /** Registra la lectura del anuncio por una persona (idempotente). */
  async markRead(organizationId: string, id: string, dto: MarkReadDto) {
    const personId = new Types.ObjectId(dto.personId);
    // Idempotente: solo agrega el recibo si esa persona no lo tiene aún.
    await this.model
      .updateOne(
        {
          _id: new Types.ObjectId(id),
          organizationId: new Types.ObjectId(organizationId),
          'readReceipts.personId': { $ne: personId },
        },
        { $push: { readReceipts: { personId, readAt: new Date() } } },
      )
      .exec();
    return this.repo.findByIdOrFail(organizationId, id);
  }
}
