import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CommonAreaRepository,
  ReservationRepository,
} from './reservations.repositories';
import {
  CreateCommonAreaDto,
  CreateReservationDto,
  UpdateCommonAreaDto,
} from './dto/reservation.dto';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { buildPaginatedResult, PaginationQueryDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly areas: CommonAreaRepository,
    private readonly reservations: ReservationRepository,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  // ─── Áreas comunes ────────────────────────────────────────────────────────

  createArea(organizationId: string, dto: CreateCommonAreaDto) {
    return this.areas.create(organizationId, dto as never);
  }

  listAreas(organizationId: string, condominiumId: string) {
    return this.areas.find(organizationId, { condominiumId });
  }

  updateArea(organizationId: string, id: string, dto: UpdateCommonAreaDto) {
    return this.areas.updateById(organizationId, id, dto);
  }

  // ─── Reservas ──────────────────────────────────────────────────────────────

  async createReservation(organizationId: string, dto: CreateReservationDto) {
    const start = new Date(dto.startAt);
    const end = new Date(dto.endAt);
    if (end <= start) {
      throw new BadRequestException('endAt debe ser posterior a startAt');
    }

    const area = await this.areas.findByIdOrFail(organizationId, dto.commonAreaId);
    if (!area.isActive) {
      throw new BadRequestException('El área común no está disponible');
    }
    if (area.maxDurationMinutes > 0) {
      const durationMin = (end.getTime() - start.getTime()) / 60000;
      if (durationMin > area.maxDurationMinutes) {
        throw new BadRequestException(
          `La reserva excede la duración máxima (${area.maxDurationMinutes} min)`,
        );
      }
    }

    // Anti-solape: existe otra reserva CONFIRMED que se cruza con [start, end).
    const overlap = await this.reservationModel
      .findOne({
        organizationId: new Types.ObjectId(organizationId),
        commonAreaId: new Types.ObjectId(dto.commonAreaId),
        status: 'CONFIRMED',
        startAt: { $lt: end },
        endAt: { $gt: start },
      })
      .exec();
    if (overlap) {
      throw new ConflictException('El área ya está reservada en ese horario');
    }

    return this.reservations.create(organizationId, {
      commonAreaId: new Types.ObjectId(dto.commonAreaId),
      condominiumId: area.condominiumId,
      apartmentId: new Types.ObjectId(dto.apartmentId),
      personId: dto.personId ? new Types.ObjectId(dto.personId) : null,
      startAt: start,
      endAt: end,
      status: 'CONFIRMED',
      notes: dto.notes,
    } as never);
  }

  async listReservations(
    organizationId: string,
    filters: { commonAreaId?: string; apartmentId?: string; status?: string },
    query: PaginationQueryDto,
  ) {
    const filter: Record<string, unknown> = {};
    if (filters.commonAreaId) filter.commonAreaId = filters.commonAreaId;
    if (filters.apartmentId) filter.apartmentId = filters.apartmentId;
    if (filters.status) filter.status = filters.status;
    const { items, total } = await this.reservations.paginate(
      organizationId,
      filter,
      query.page,
      query.pageSize,
      { startAt: -1 },
    );
    return buildPaginatedResult(items, total, query.page, query.pageSize);
  }

  async cancelReservation(organizationId: string, id: string) {
    const reservation = await this.reservations.findByIdOrFail(organizationId, id);
    if (reservation.status === 'CANCELLED') {
      throw new BadRequestException('La reserva ya está cancelada');
    }
    return this.reservations.updateById(organizationId, id, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    });
  }
}
