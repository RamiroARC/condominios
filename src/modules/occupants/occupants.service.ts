import { Injectable } from '@nestjs/common';
import { OccupantsRepository } from './occupants.repository';
import { CreateOccupantDto, EndOccupancyDto } from './dto/occupant.dto';

@Injectable()
export class OccupantsService {
  constructor(private readonly repo: OccupantsRepository) {}

  create(organizationId: string, dto: CreateOccupantDto) {
    return this.repo.create(organizationId, {
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      status: 'ACTIVE',
    } as never);
  }

  /** Ocupantes actuales (activos) de un departamento. */
  listByApartment(organizationId: string, apartmentId: string) {
    return this.repo.find(organizationId, { apartmentId, status: 'ACTIVE' });
  }

  /** Historial de ocupación de una persona. */
  listByPerson(organizationId: string, personId: string) {
    return this.repo.find(organizationId, { personId });
  }

  /** Cierra una ocupación (fin de arriendo/residencia). */
  endOccupancy(organizationId: string, id: string, dto: EndOccupancyDto) {
    return this.repo.updateById(organizationId, id, {
      endDate: new Date(dto.endDate),
      status: 'ENDED',
    } as never);
  }
}
