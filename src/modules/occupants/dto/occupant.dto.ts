import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { OCCUPANT_ROLES } from '../schemas/apartment-occupant.schema';

export class CreateOccupantDto {
  @IsMongoId()
  condominiumId!: string;

  @IsMongoId()
  apartmentId!: string;

  @IsMongoId()
  personId!: string;

  @IsIn(OCCUPANT_ROLES as unknown as string[])
  role!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class EndOccupancyDto {
  @IsDateString()
  endDate!: string;
}
