import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Parámetros de paginación estándar para listados. */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Filtros comunes de scoping por entidad relacionada. Se declaran aquí para
   * que el ValidationPipe (whitelist + forbidNonWhitelisted) los acepte como
   * query params en los listados que combinan @Query() con este DTO.
   */
  @IsOptional()
  @IsString()
  condominiumId?: string;

  @IsOptional()
  @IsString()
  buildingId?: string;

  @IsOptional()
  @IsString()
  apartmentId?: string;

  @IsOptional()
  @IsString()
  periodId?: string;

  @IsOptional()
  @IsString()
  commonAreaId?: string;

  @IsOptional()
  @IsString()
  personId?: string;

  @IsOptional()
  @IsString()
  chargeId?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

/** Respuesta paginada genérica. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 0,
  };
}
