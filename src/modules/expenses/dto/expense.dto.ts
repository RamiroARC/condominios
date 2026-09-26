import { IsDateString, IsIn, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EXPENSE_CATEGORIES } from '../schemas/expense.schema';

export class CreateExpenseDto {
  @IsMongoId()
  condominiumId!: string;

  @IsIn(EXPENSE_CATEGORIES as unknown as string[])
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsDateString()
  incurredAt!: string;
}
