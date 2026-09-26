import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from './auth-user.decorator';

interface JwtPayload {
  sub: string;
  organizationId: string | null;
  email: string;
  permissions: string[];
  condominiumIds: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret')!,
    });
  }

  /** Lo que retorna se adjunta a request.user. */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    return {
      userId: payload.sub,
      organizationId: payload.organizationId,
      email: payload.email,
      permissions: payload.permissions ?? [],
      condominiumIds: payload.condominiumIds ?? [],
    };
  }
}
