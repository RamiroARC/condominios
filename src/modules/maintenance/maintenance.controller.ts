import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import {
  AssignTicketDto,
  ChangeStatusDto,
  CreateTicketDto,
  UpdateTicketDto,
} from './dto/maintenance.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('maintenance-tickets')
@UseGuards(TenantGuard, PermissionsGuard)
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  @Auditable({ module: 'maintenance', entity: 'MaintenanceTicket' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTicketDto) {
    return this.service.create(user.organizationId!, user.userId, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.MAINTENANCE_READ)
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @Query('condominiumId') condominiumId?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.service.list(
      user.organizationId!,
      { condominiumId, status, assignedTo },
      query,
    );
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.MAINTENANCE_READ)
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.organizationId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  @Auditable({ module: 'maintenance', entity: 'MaintenanceTicket' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Patch(':id/assign')
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  @Auditable({ module: 'maintenance', entity: 'MaintenanceTicket' })
  assign(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return this.service.assign(user.organizationId!, id, user.userId, dto);
  }

  @Patch(':id/status')
  @RequirePermissions(PERMISSIONS.MAINTENANCE_WRITE)
  @Auditable({ module: 'maintenance', entity: 'MaintenanceTicket' })
  changeStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.service.changeStatus(user.organizationId!, id, user.userId, dto);
  }
}
