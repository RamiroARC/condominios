import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';
import { CreateReadingDto } from './dto/utility-reading.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('utility-readings')
@UseGuards(TenantGuard, PermissionsGuard)
export class UtilitiesController {
  constructor(private readonly service: UtilitiesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.UTILITIES_WRITE)
  @Auditable({ module: 'utilities', entity: 'UtilityReading' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReadingDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.UTILITIES_READ)
  list(
    @CurrentUser() user: AuthUser,
    @Query('condominiumId') condominiumId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('utilityType') utilityType?: string,
  ) {
    return this.service.list(
      user.organizationId!,
      condominiumId,
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
      utilityType ?? 'WATER',
    );
  }
}
