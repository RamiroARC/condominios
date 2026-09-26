import { BadRequestException, Injectable } from '@nestjs/common';
import { UtilitiesRepository } from './utilities.repository';
import { CreateReadingDto } from './dto/utility-reading.dto';

@Injectable()
export class UtilitiesService {
  constructor(private readonly repo: UtilitiesRepository) {}

  create(organizationId: string, dto: CreateReadingDto) {
    if (dto.currentReading < dto.previousReading) {
      throw new BadRequestException(
        'La lectura actual no puede ser menor que la anterior',
      );
    }
    return this.repo.create(organizationId, {
      ...dto,
      utilityType: dto.utilityType ?? 'WATER',
      consumption: Math.round((dto.currentReading - dto.previousReading) * 1000) / 1000,
    } as never);
  }

  /** Lecturas de un condominio para un periodo (por defecto agua). */
  list(
    organizationId: string,
    condominiumId: string,
    year?: number,
    month?: number,
    utilityType = 'WATER',
  ) {
    const filter: Record<string, unknown> = { condominiumId, utilityType };
    if (year) filter.year = year;
    if (month) filter.month = month;
    return this.repo.find(organizationId, filter, { sort: { apartmentId: 1 } });
  }
}
