import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, SetRolesDto, UpdateUserDto } from './dto/user.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('users')
@UseGuards(TenantGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_READ)
  list(@CurrentUser() user: AuthUser) {
    return this.service.list(user.organizationId!);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USERS_WRITE)
  @Auditable({ module: 'users', entity: 'User' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUserDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS_WRITE)
  @Auditable({ module: 'users', entity: 'User' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Put(':id/roles')
  @RequirePermissions(PERMISSIONS.USERS_WRITE)
  @Auditable({ module: 'users', entity: 'UserRole' })
  setRoles(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SetRolesDto) {
    return this.service.setRoles(user.organizationId!, id, dto.roleIds);
  }
}
