import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('assets')
@UseGuards(TenantGuard, PermissionsGuard)
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ASSETS_WRITE)
  @Auditable({ module: 'assets', entity: 'Asset' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAssetDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ASSETS_READ)
  list(@CurrentUser() user: AuthUser, @Query('condominiumId') condominiumId: string) {
    return this.service.list(user.organizationId!, condominiumId);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ASSETS_WRITE)
  @Auditable({ module: 'assets', entity: 'Asset' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.service.update(user.organizationId!, id, dto);
  }
}
