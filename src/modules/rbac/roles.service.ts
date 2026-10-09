import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { PERMISSIONS } from './permissions';

const VALID_PERMISSIONS = new Set<string>(Object.values(PERMISSIONS));

/**
 * Roles a nivel de organización. Los roles del sistema (isSystem) no se editan
 * ni eliminan. Los permisos deben pertenecer al catálogo conocido.
 */
@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private readonly model: Model<RoleDocument>) {}

  private validatePermissions(perms: string[]) {
    const invalid = perms.filter((p) => !VALID_PERMISSIONS.has(p));
    if (invalid.length) {
      throw new BadRequestException(`Permisos inválidos: ${invalid.join(', ')}`);
    }
  }

  list(organizationId: string) {
    const orgId = new Types.ObjectId(organizationId);
    // Roles de la organización + roles de plataforma (organizationId null).
    return this.model
      .find({ $or: [{ organizationId: orgId }, { organizationId: null }] })
      .sort({ isSystem: -1, name: 1 })
      .exec();
  }

  create(organizationId: string, dto: CreateRoleDto) {
    this.validatePermissions(dto.permissions);
    return this.model.create({
      organizationId: new Types.ObjectId(organizationId),
      key: dto.key,
      name: dto.name,
      description: dto.description,
      permissions: dto.permissions,
      isSystem: false,
    });
  }

  async update(organizationId: string, id: string, dto: UpdateRoleDto) {
    if (dto.permissions) this.validatePermissions(dto.permissions);
    const role = await this.model.findById(id).exec();
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (role.isSystem) throw new BadRequestException('Los roles del sistema no se editan');
    Object.assign(role, dto);
    return role.save();
  }

  async remove(organizationId: string, id: string) {
    const role = await this.model.findById(id).exec();
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (role.isSystem) throw new BadRequestException('Los roles del sistema no se eliminan');
    await this.model.deleteOne({ _id: id }).exec();
  }
}
