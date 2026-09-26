import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCommonAreaDto {
  @IsMongoId()
  condominiumId!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservationFee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDurationMinutes?: number;
}

export class UpdateCommonAreaDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservationFee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxDurationMinutes?: number;

  @IsOptional()
  isActive?: boolean;
}

export class CreateReservationDto {
  @IsMongoId()
  commonAreaId!: string;

  @IsMongoId()
  apartmentId!: string;

  @IsOptional()
  @IsMongoId()
  personId?: string;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
