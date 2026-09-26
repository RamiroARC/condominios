/**
 * Configuración tipada leída de variables de entorno.
 * No contiene valores por defecto sensibles; los secretos vienen del .env.
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  throttle: {
    ttl: number;
    limit: number;
  };
  corsOrigins: string[];
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '120', 10),
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
});
