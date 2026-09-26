import {
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '../schemas/maintenance-ticket.schema';

export class CreateTicketDto {
  @IsMongoId()
  condominiumId!: string;

  @IsOptional()
  @IsMongoId()
  apartmentId?: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(TICKET_CATEGORIES as unknown as string[])
  category?: string;

  @IsOptional()
  @IsIn(TICKET_PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  reportedBy?: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(TICKET_CATEGORIES as unknown as string[])
  category?: string;

  @IsOptional()
  @IsIn(TICKET_PRIORITIES as unknown as string[])
  priority?: string;
}

export class AssignTicketDto {
  @IsMongoId()
  assignedTo!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ChangeStatusDto {
  @IsIn(TICKET_STATUSES as unknown as string[])
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
