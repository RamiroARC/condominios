import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { SummaryQueryDto } from './dto/dashboard.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

@Controller('dashboard')
@UseGuards(TenantGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @RequirePermissions(PERMISSIONS.DASHBOARD_READ)
  summary(@CurrentUser() user: AuthUser, @Query() query: SummaryQueryDto) {
    return this.service.summary(
      user.organizationId!,
      query.condominiumId,
      query.periodId,
    );
  }
}
