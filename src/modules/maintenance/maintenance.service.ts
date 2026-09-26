import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { MaintenanceRepository } from './maintenance.repository';
import {
  AssignTicketDto,
  ChangeStatusDto,
  CreateTicketDto,
  UpdateTicketDto,
} from './dto/maintenance.dto';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';
import { TicketStatus } from './schemas/maintenance-ticket.schema';

/** Transiciones de estado permitidas. Evita saltos inválidos del ciclo de vida. */
const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['ASSIGNED', 'IN_PROGRESS', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
};

@Injectable()
export class MaintenanceService {
  constructor(private readonly repo: MaintenanceRepository) {}

  create(organizationId: string, userId: string, dto: CreateTicketDto) {
    return this.repo.create(organizationId, {
      ...dto,
      status: 'OPEN',
      history: [
        {
          status: 'OPEN',
          changedBy: new Types.ObjectId(userId),
          changedAt: new Date(),
        },
      ],
    } as never);
  }

  async list(
    organizationId: string,
    filters: { condominiumId?: string; status?: string; assignedTo?: string },
    query: PaginationQueryDto,
  ) {
    const filter: Record<string, unknown> = {};
    if (filters.condominiumId) filter.condominiumId = filters.condominiumId;
    if (filters.status) filter.status = filters.status;
    if (filters.assignedTo) filter.assignedTo = filters.assignedTo;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };

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

  update(organizationId: string, id: string, dto: UpdateTicketDto) {
    return this.repo.updateById(organizationId, id, dto);
  }

  async assign(organizationId: string, id: string, userId: string, dto: AssignTicketDto) {
    const ticket = await this.repo.findByIdOrFail(organizationId, id);
    this.ensureTransition(ticket.status as TicketStatus, 'ASSIGNED');
    return this.repo.updateById(organizationId, id, {
      assignedTo: new Types.ObjectId(dto.assignedTo),
      status: 'ASSIGNED',
      $push: {
        history: {
          status: 'ASSIGNED',
          changedBy: new Types.ObjectId(userId),
          note: dto.note,
          changedAt: new Date(),
        },
      },
    } as never);
  }

  async changeStatus(
    organizationId: string,
    id: string,
    userId: string,
    dto: ChangeStatusDto,
  ) {
    const ticket = await this.repo.findByIdOrFail(organizationId, id);
    this.ensureTransition(ticket.status as TicketStatus, dto.status as TicketStatus);

    const update: Record<string, unknown> = {
      status: dto.status,
      $push: {
        history: {
          status: dto.status,
          changedBy: new Types.ObjectId(userId),
          note: dto.note,
          changedAt: new Date(),
        },
      },
    };
    if (dto.status === 'RESOLVED') update.resolvedAt = new Date();

    return this.repo.updateById(organizationId, id, update as never);
  }

  private ensureTransition(from: TicketStatus, to: TicketStatus) {
    const allowed = ALLOWED_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Transición de estado no permitida: ${from} → ${to}`,
      );
    }
  }
}
