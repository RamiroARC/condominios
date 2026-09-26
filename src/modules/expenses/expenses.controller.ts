import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/expense.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('expenses')
@UseGuards(TenantGuard, PermissionsGuard)
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.EXPENSES_WRITE)
  @Auditable({ module: 'expenses', entity: 'Expense' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateExpenseDto) {
    return this.service.create(user.organizationId!, dto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.EXPENSES_READ)
  list(@CurrentUser() user: AuthUser, @Query('condominiumId') condominiumId: string) {
    return this.service.list(user.organizationId!, condominiumId);
  }
}
