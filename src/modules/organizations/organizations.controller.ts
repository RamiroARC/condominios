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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

/**
 * Endpoints de nivel PLATAFORMA (gestionados por SUPER_ADMIN).
 * A diferencia del resto de módulos, NO usa TenantGuard: no está limitado a una
 * organización, opera sobre todas. La autorización se controla vía permisos
 * organizations:read / organizations:write.
 */
@Controller('organizations')
@UseGuards(PermissionsGuard)
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_WRITE)
  create(@Body() dto: CreateOrganizationDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_READ)
  list(@Query() query: PaginationQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_READ)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ORGANIZATIONS_WRITE)
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(id, dto);
  }
}
