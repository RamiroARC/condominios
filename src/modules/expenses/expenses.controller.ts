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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
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

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.EXPENSES_WRITE)
  @Auditable({ module: 'expenses', entity: 'Expense' })
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.service.update(user.organizationId!, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.EXPENSES_WRITE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Auditable({ module: 'expenses', entity: 'Expense' })
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.organizationId!, id);
  }
}
