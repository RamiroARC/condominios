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
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto, UpdateBuildingDto } from './dto/building.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

@Controller('buildings')
@UseGuards(TenantGuard, PermissionsGuard)
export class BuildingsController {
  constructor(private readonly service: BuildingsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.BUILDINGS_WRITE)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBuildingDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.BUILDINGS_READ)
  list(
    @CurrentUser() user: AuthUser,
    @Query('condominiumId') condominiumId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.service.list(user.organizationId!, condominiumId, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.BUILDINGS_READ)
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.organizationId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.BUILDINGS_WRITE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateBuildingDto,
  ) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.BUILDINGS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
