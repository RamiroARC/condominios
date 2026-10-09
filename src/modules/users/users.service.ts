import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole, UserRoleDocument } from '../rbac/schemas/user-role.schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/** Usuario con sus roles resueltos, sin exponer el hash de contraseña. */
export interface UserWithRoles {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  roleIds: string[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserRole.name) private readonly userRoleModel: Model<UserRoleDocument>,
  ) {}

  async list(organizationId: string): Promise<UserWithRoles[]> {
    const orgId = new Types.ObjectId(organizationId);
    const users = await this.userModel.find({ organizationId: orgId }).sort({ createdAt: -1 }).exec();
    const assignments = await this.userRoleModel
      .find({ organizationId: orgId })
      .exec();
    const rolesByUser = new Map<string, string[]>();
    for (const a of assignments) {
      const uid = String(a.userId);
      if (!rolesByUser.has(uid)) rolesByUser.set(uid, []);
      rolesByUser.get(uid)!.push(String(a.roleId));
    }
    return users.map((u) => ({
      _id: String(u._id),
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      status: u.status,
      roleIds: rolesByUser.get(String(u._id)) ?? [],
    }));
  }

  async create(organizationId: string, dto: CreateUserDto) {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();
    if (exists) throw new BadRequestException('Ya existe un usuario con ese email');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.userModel.create({
      organizationId: new Types.ObjectId(organizationId),
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      status: 'ACTIVE',
    });

    if (dto.roleIds?.length) {
      await this.setRoles(organizationId, String(user._id), dto.roleIds);
    }
    return { _id: String(user._id), email: user.email };
  }

  async update(organizationId: string, id: string, dto: UpdateUserDto) {
    const orgId = new Types.ObjectId(organizationId);
    const user = await this.userModel.findOne({ _id: id, organizationId: orgId }).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    Object.assign(user, dto);
    await user.save();
    return { _id: String(user._id), status: user.status };
  }

  /** Reemplaza el conjunto de roles del usuario (dentro de su organización). */
  async setRoles(organizationId: string, userId: string, roleIds: string[]) {
    const orgId = new Types.ObjectId(organizationId);
    const uid = new Types.ObjectId(userId);
    await this.userRoleModel.deleteMany({ organizationId: orgId, userId: uid }).exec();
    if (roleIds.length) {
      await this.userRoleModel.insertMany(
        roleIds.map((rid) => ({
          organizationId: orgId,
          userId: uid,
          roleId: new Types.ObjectId(rid),
          condominiumId: null,
        })),
      );
    }
    return { userId, roleIds };
  }
}
