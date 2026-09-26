import { IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { AUDIENCE_TYPES } from '../schemas/announcement.schema';

export class CreateAnnouncementDto {
  @IsMongoId()
  condominiumId!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsIn(AUDIENCE_TYPES as unknown as string[])
  audienceType?: string;

  @IsOptional()
  @IsMongoId()
  audienceRefId?: string;
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsIn(AUDIENCE_TYPES as unknown as string[])
  audienceType?: string;

  @IsOptional()
  @IsMongoId()
  audienceRefId?: string;
}

export class MarkReadDto {
  @IsMongoId()
  personId!: string;
}
