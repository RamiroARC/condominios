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
  Query,
  UseGuards,
} from '@nestjs/common';
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
  list(
    @CurrentUser() user: AuthUser,
    @Query('condominiumId') condominiumId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.list(user.organizationId!, condominiumId, buildingId);
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

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.ASSETS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auditable({ module: 'assets', entity: 'Asset' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
