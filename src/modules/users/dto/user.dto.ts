import {
  IsArray,
  IsEmail,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /** IDs de roles a asignar al crear. */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  roleIds?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'INACTIVE'])
  status?: string;
}

export class SetRolesDto {
  @IsArray()
  @IsMongoId({ each: true })
  roleIds!: string[];
}
