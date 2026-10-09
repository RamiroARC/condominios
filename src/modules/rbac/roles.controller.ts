import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from './permissions.guard';
import { RequirePermissions } from './decorators';
import { PERMISSIONS } from './permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('roles')
@UseGuards(TenantGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ROLES_READ)
  list(@CurrentUser() user: AuthUser) {
    return this.service.list(user.organizationId!);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.ROLES_WRITE)
  @Auditable({ module: 'roles', entity: 'Role' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRoleDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ROLES_WRITE)
  @Auditable({ module: 'roles', entity: 'Role' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ROLES_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auditable({ module: 'roles', entity: 'Role' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
