import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { PaginationQueryDto, buildPaginatedResult } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';

@Controller('audit-logs')
@UseGuards(TenantGuard, PermissionsGuard)
export class AuditController {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly model: Model<AuditLogDocument>,
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_READ)
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
  ) {
    const filter: Record<string, unknown> = {
      organizationId: new Types.ObjectId(user.organizationId!),
    };
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return buildPaginatedResult(items, total, query.page, query.pageSize);
  }
}
