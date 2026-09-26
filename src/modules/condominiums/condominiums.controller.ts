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
import { CondominiumsService } from './condominiums.service';
import { CreateCondominiumDto, UpdateCondominiumDto } from './dto/condominium.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

@Controller('condominiums')
@UseGuards(TenantGuard, PermissionsGuard)
export class CondominiumsController {
  constructor(private readonly service: CondominiumsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CONDOMINIUMS_WRITE)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCondominiumDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.CONDOMINIUMS_READ)
  list(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.organizationId!, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CONDOMINIUMS_READ)
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.organizationId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.CONDOMINIUMS_WRITE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCondominiumDto,
  ) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CONDOMINIUMS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
