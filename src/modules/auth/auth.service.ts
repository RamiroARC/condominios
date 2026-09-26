import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UserRole, UserRoleDocument } from '../rbac/schemas/user-role.schema';
import { Role, RoleDocument } from '../rbac/schemas/role.schema';
import type { AuthTokens } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRoleDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Valida credenciales y emite el par de tokens. */
  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user._id, tokens.refreshToken);
    user.lastLoginAt = new Date();
    await user.save();
    return tokens;
  }

  /** Rota el refresh token y emite un nuevo par. */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash')
      .exec();

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Sesión no válida');
    }

    const matches = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!matches) throw new UnauthorizedException('Sesión no válida');

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user._id, tokens.refreshToken);
    return tokens;
  }

  /** Invalida el refresh token vigente. */
  async logout(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshTokenHash: null } },
    );
  }

  /** Reúne los permisos efectivos y los condominios accesibles del usuario. */
  private async resolveAccess(user: UserDocument): Promise<{
    permissions: string[];
    condominiumIds: string[];
  }> {
    const assignments = await this.userRoleModel.find({ userId: user._id }).exec();
    if (assignments.length === 0) return { permissions: [], condominiumIds: [] };

    const roleIds = assignments.map((a) => a.roleId);
    const roles = await this.roleModel.find({ _id: { $in: roleIds } }).exec();

    const permissions = new Set<string>();
    roles.forEach((r) => r.permissions.forEach((p) => permissions.add(p)));

    const condominiumIds = assignments
      .map((a) => a.condominiumId?.toString())
      .filter((id): id is string => Boolean(id));

    return {
      permissions: [...permissions],
      condominiumIds: [...new Set(condominiumIds)],
    };
  }

  private async issueTokens(user: UserDocument): Promise<AuthTokens> {
    const { permissions, condominiumIds } = await this.resolveAccess(user);
    const basePayload = {
      sub: user._id.toString(),
      organizationId: user.organizationId?.toString() ?? null,
      email: user.email,
    };

    const accessToken = await this.jwt.signAsync(
      { ...basePayload, permissions, condominiumIds },
      {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get<string>('jwt.accessTtl'),
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user._id.toString() },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshTtl'),
      },
    );

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    userId: Types.ObjectId,
    refreshToken: string,
  ): Promise<void> {
    const hash = await argon2.hash(refreshToken);
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { refreshTokenHash: hash } },
    );
  }
}
