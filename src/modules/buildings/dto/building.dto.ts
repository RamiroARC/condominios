import { IsIn, IsInt, IsMongoId, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateBuildingDto {
  @IsMongoId()
  condominiumId!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsString()
  @MaxLength(30)
  code!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  floors?: number;
}

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  floors?: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;
}
