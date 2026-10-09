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
import { ReservationsService } from './reservations.service';
import {
  CreateCommonAreaDto,
  CreateReservationDto,
  UpdateCommonAreaDto,
} from './dto/reservation.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('reservations')
@UseGuards(TenantGuard, PermissionsGuard)
export class ReservationsController {
  constructor(private readonly service: ReservationsService) {}

  // ─── Áreas comunes ────────────────────────────────────────────────────────

  @Post('areas')
  @RequirePermissions(PERMISSIONS.RESERVATIONS_WRITE)
  @Auditable({ module: 'reservations', entity: 'CommonArea' })
  createArea(@CurrentUser() user: AuthUser, @Body() dto: CreateCommonAreaDto) {
    return this.service.createArea(user.organizationId!, dto);
  }

  @Get('areas')
  @RequirePermissions(PERMISSIONS.RESERVATIONS_READ)
  listAreas(
    @CurrentUser() user: AuthUser,
    @Query('condominiumId') condominiumId: string,
  ) {
    return this.service.listAreas(user.organizationId!, condominiumId);
  }

  @Patch('areas/:id')
  @RequirePermissions(PERMISSIONS.RESERVATIONS_WRITE)
  @Auditable({ module: 'reservations', entity: 'CommonArea' })
  updateArea(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCommonAreaDto,
  ) {
    return this.service.updateArea(user.organizationId!, id, dto);
  }

  @Delete('areas/:id')
  @RequirePermissions(PERMISSIONS.RESERVATIONS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auditable({ module: 'reservations', entity: 'CommonArea' })
  removeArea(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.removeArea(user.organizationId!, id);
  }

  // ─── Reservas ──────────────────────────────────────────────────────────────

  @Post()
  @RequirePermissions(PERMISSIONS.RESERVATIONS_WRITE)
  @Auditable({ module: 'reservations', entity: 'Reservation' })
  createReservation(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateReservationDto,
  ) {
    return this.service.createReservation(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.RESERVATIONS_READ)
  listReservations(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @Query('commonAreaId') commonAreaId?: string,
    @Query('apartmentId') apartmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listReservations(
      user.organizationId!,
      { commonAreaId, apartmentId, status },
      query,
    );
  }

  @Patch(':id/cancel')
  @RequirePermissions(PERMISSIONS.RESERVATIONS_WRITE)
  @Auditable({ module: 'reservations', entity: 'Reservation' })
  cancelReservation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.cancelReservation(user.organizationId!, id);
  }
}
