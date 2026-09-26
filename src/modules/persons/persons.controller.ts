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
import { PersonsService } from './persons.service';
import { CreatePersonDto, UpdatePersonDto } from './dto/person.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

@Controller('persons')
@UseGuards(TenantGuard, PermissionsGuard)
export class PersonsController {
  constructor(private readonly service: PersonsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.PERSONS_WRITE)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePersonDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.PERSONS_READ)
  list(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return this.service.list(user.organizationId!, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.PERSONS_READ)
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.organizationId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.PERSONS_WRITE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.PERSONS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
