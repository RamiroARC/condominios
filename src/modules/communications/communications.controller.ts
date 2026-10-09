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
import { CommunicationsService } from './communications.service';
import {
  CreateAnnouncementDto,
  MarkReadDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('announcements')
@UseGuards(TenantGuard, PermissionsGuard)
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_WRITE)
  @Auditable({ module: 'communications', entity: 'Announcement' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAnnouncementDto) {
    return this.service.create(user.organizationId!, user.userId, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_READ)
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @Query('condominiumId') condominiumId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list(user.organizationId!, { condominiumId, status }, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_READ)
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.organizationId!, id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_WRITE)
  @Auditable({ module: 'communications', entity: 'Announcement' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Patch(':id/publish')
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_WRITE)
  @Auditable({ module: 'communications', entity: 'Announcement' })
  publish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.publish(user.organizationId!, id);
  }

  @Patch(':id/archive')
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_WRITE)
  @Auditable({ module: 'communications', entity: 'Announcement' })
  archive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.archive(user.organizationId!, id);
  }

  @Patch(':id/read')
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_READ)
  markRead(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: MarkReadDto,
  ) {
    return this.service.markRead(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COMMUNICATIONS_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auditable({ module: 'communications', entity: 'Announcement' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
