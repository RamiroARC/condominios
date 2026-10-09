import { IsMongoId, IsOptional } from 'class-validator';

export class SummaryQueryDto {
  @IsMongoId()
  condominiumId!: string;

  /** Periodo de facturación opcional; si se omite se toma el más reciente. */
  @IsOptional()
  @IsMongoId()
  periodId?: string;

  /** Edificio opcional; si se indica, mantenimiento y activos se filtran por él. */
  @IsOptional()
  @IsMongoId()
  buildingId?: string;
}
