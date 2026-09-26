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
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

@Controller('apartments')
@UseGuards(TenantGuard, PermissionsGuard)
export class ApartmentsController {
  constructor(private readonly service: ApartmentsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.APARTMENTS_WRITE)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApartmentDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.APARTMENTS_READ)
  list(
    @CurrentUser() user: AuthUser,
    @Query('buildingId') buildingId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.list(user.organizationId!, buildingId, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.APARTMENTS_READ)
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.organizationId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.APARTMENTS_WRITE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateApartmentDto,
  ) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.APARTMENTS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
