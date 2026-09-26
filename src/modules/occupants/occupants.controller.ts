import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { OccupantsService } from './occupants.service';
import { CreateOccupantDto, EndOccupancyDto } from './dto/occupant.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

@Controller('occupants')
@UseGuards(TenantGuard, PermissionsGuard)
export class OccupantsController {
  constructor(private readonly service: OccupantsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.OCCUPANTS_WRITE)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOccupantDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.OCCUPANTS_READ)
  list(
    @CurrentUser() user: AuthUser,
    @Query('apartmentId') apartmentId?: string,
    @Query('personId') personId?: string,
  ) {
    if (personId) return this.service.listByPerson(user.organizationId!, personId);
    return this.service.listByApartment(user.organizationId!, apartmentId!);
  }

  @Patch(':id/end')
  @RequirePermissions(PERMISSIONS.OCCUPANTS_WRITE)
  end(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: EndOccupancyDto,
  ) {
    return this.service.endOccupancy(user.organizationId!, id, dto);
  }
}
