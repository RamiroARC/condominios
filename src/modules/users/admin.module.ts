import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from '../rbac/schemas/role.schema';
import { UserRole, UserRoleSchema } from '../rbac/schemas/user-role.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesService } from '../rbac/roles.service';
import { RolesController } from '../rbac/roles.controller';

/**
 * Administración de identidad: usuarios y roles de la organización.
 * Agrupa ambos por compartir los schemas User/Role/UserRole.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [UsersController, RolesController],
  providers: [UsersService, RolesService],
})
export class AdminModule {}
