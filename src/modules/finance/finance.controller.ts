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
import { FinanceService } from './finance.service';
import {
  CreateConceptDto,
  CreatePeriodDto,
  GenerateChargesDto,
  RegisterPaymentDto,
  UpdateConceptDto,
} from './dto/finance.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { CurrentUser, AuthUser } from '../auth/auth-user.decorator';
import { TenantGuard } from '../tenant/tenant.guard';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { RequirePermissions } from '../rbac/decorators';
import { PERMISSIONS } from '../rbac/permissions';
import { Auditable } from '../audit/audit.decorator';

@Controller('finance')
@UseGuards(TenantGuard, PermissionsGuard)
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  // ─── Conceptos ─────────────────────────────────────────────────────────────

  @Post('concepts')
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  @Auditable({ module: 'finance', entity: 'FeeConcept' })
  createConcept(@CurrentUser() user: AuthUser, @Body() dto: CreateConceptDto) {
    return this.service.createConcept(user.organizationId!, dto);
  }

  @Get('concepts')
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  listConcepts(
    @CurrentUser() user: AuthUser,
    @Query('condominiumId') condominiumId: string,
  ) {
    return this.service.listConcepts(user.organizationId!, condominiumId);
  }

  @Patch('concepts/:id')
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  @Auditable({ module: 'finance', entity: 'FeeConcept' })
  updateConcept(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateConceptDto,
  ) {
    return this.service.updateConcept(user.organizationId!, id, dto);
  }

  // ─── Periodos ────────────────────────────────────────────────────────────────

  @Post('periods')
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  @Auditable({ module: 'finance', entity: 'BillingPeriod' })
  createPeriod(@CurrentUser() user: AuthUser, @Body() dto: CreatePeriodDto) {
    return this.service.createPeriod(user.organizationId!, dto);
  }

  @Get('periods')
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  listPeriods(
    @CurrentUser() user: AuthUser,
    @Query('condominiumId') condominiumId: string,
  ) {
    return this.service.listPeriods(user.organizationId!, condominiumId);
  }

  @Post('periods/:id/generate-charges')
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  @Auditable({ module: 'finance', entity: 'Charge' })
  generateCharges(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: GenerateChargesDto,
  ) {
    return this.service.generateCharges(user.organizationId!, id, dto);
  }

  @Post('periods/:id/close')
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  @Auditable({ module: 'finance', entity: 'BillingPeriod' })
  closePeriod(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.closePeriod(user.organizationId!, id);
  }

  // ─── Cargos ──────────────────────────────────────────────────────────────────

  @Get('charges')
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  listCharges(
    @CurrentUser() user: AuthUser,
    @Query() query: PaginationQueryDto,
    @Query('periodId') periodId?: string,
    @Query('apartmentId') apartmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listCharges(
      user.organizationId!,
      { periodId, apartmentId, status },
      query,
    );
  }

  // ─── Pagos ────────────────────────────────────────────────────────────────────

  @Post('payments')
  @RequirePermissions(PERMISSIONS.FINANCE_WRITE)
  @Auditable({ module: 'finance', entity: 'Payment' })
  registerPayment(
    @CurrentUser() user: AuthUser,
    @Body() dto: RegisterPaymentDto,
  ) {
    return this.service.registerPayment(user.organizationId!, user.userId, dto);
  }

  @Get('payments')
  @RequirePermissions(PERMISSIONS.FINANCE_READ)
  listPayments(
    @CurrentUser() user: AuthUser,
    @Query('chargeId') chargeId: string,
  ) {
    return this.service.listPayments(user.organizationId!, chargeId);
  }
}
