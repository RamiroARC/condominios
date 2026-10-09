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

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.UTILITIES_WRITE)
  @Auditable({ module: 'utilities', entity: 'UtilityReading' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: CreateReadingDto) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.UTILITIES_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auditable({ module: 'utilities', entity: 'UtilityReading' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
