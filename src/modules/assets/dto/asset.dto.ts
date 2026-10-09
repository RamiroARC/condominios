import { IsDateString, IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { ASSET_STATUSES, ASSET_TYPES } from '../schemas/asset.schema';

export class CreateAssetDto {
  @IsMongoId()
  condominiumId!: string;

  /** Opcional: si se indica, el activo pertenece a ese edificio. */
  @IsOptional()
  @IsMongoId()
  buildingId?: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsIn(ASSET_TYPES as unknown as string[])
  type?: string;

  @IsOptional()
  @IsDateString()
  nextMaintenanceAt?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsIn(ASSET_STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsDateString()
  nextMaintenanceAt?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
