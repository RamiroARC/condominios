import { IsIn, IsInt, IsMongoId, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { UTILITY_TYPES } from '../schemas/utility-reading.schema';

export class CreateReadingDto {
  @IsMongoId()
  condominiumId!: string;

  @IsMongoId()
  apartmentId!: string;

  @IsOptional()
  @IsIn(UTILITY_TYPES as unknown as string[])
  utilityType?: string;

  @IsInt()
  @Min(2000)
  year!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsNumber()
  @Min(0)
  previousReading!: number;

  @IsNumber()
  @Min(0)
  currentReading!: number;
}
