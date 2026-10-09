import {
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ALLOCATION_METHODS } from '../schemas/fee-concept.schema';
import { PAYMENT_METHODS } from '../schemas/payment.schema';

export class CreateConceptDto {
  @IsMongoId()
  condominiumId!: string;

  /** Opcional: si se indica, el concepto aplica solo a ese edificio. */
  @IsOptional()
  @IsMongoId()
  buildingId?: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(ALLOCATION_METHODS as unknown as string[])
  allocationMethod?: string;

  @IsNumber()
  @Min(0)
  amount!: number;
}

export class UpdateConceptDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(ALLOCATION_METHODS as unknown as string[])
  allocationMethod?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  isActive?: boolean;
}

export class CreatePeriodDto {
  @IsMongoId()
  condominiumId!: string;

  @IsInt()
  @Min(2000)
  year!: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @IsDateString()
  dueDate!: string;
}

export class GenerateChargesDto {
  /** Conceptos a aplicar. Si se omite, se usan todos los activos del condominio. */
  @IsOptional()
  @IsMongoId({ each: true })
  conceptIds?: string[];
}

export class RegisterPaymentDto {
  @IsMongoId()
  chargeId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsOptional()
  @IsIn(PAYMENT_METHODS as unknown as string[])
  method?: string;

  @IsDateString()
  paidAt!: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
