import { plainToInstance } from 'class-transformer';
import { IsIn, IsNumberString, IsOptional, IsString, validateSync } from 'class-validator';

/**
 * Valida las variables de entorno al arrancar. Si falta algo crítico,
 * la app falla rápido (fail-fast) en lugar de comportarse de forma impredecible.
 */
class EnvironmentVariables {
  @IsIn(['development', 'test', 'staging', 'production'])
  NODE_ENV!: string;

  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsString()
  MONGODB_URI!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_ACCESS_TTL?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_TTL?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Configuración de entorno inválida:\n${errors
        .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
        .join('\n')}`,
    );
  }
  return validated;
}
