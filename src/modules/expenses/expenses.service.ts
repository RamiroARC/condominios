import { Injectable } from '@nestjs/common';
import { ExpensesRepository } from './expenses.repository';
import { CreateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly repo: ExpensesRepository) {}

  create(organizationId: string, dto: CreateExpenseDto) {
    const incurred = new Date(dto.incurredAt);
    return this.repo.create(organizationId, {
      ...dto,
      incurredAt: incurred,
      year: incurred.getFullYear(),
      month: incurred.getMonth() + 1,
    } as never);
  }

  list(organizationId: string, condominiumId: string) {
    return this.repo.find(
      organizationId,
      { condominiumId },
      { sort: { incurredAt: -1 } },
    );
  }

  update(organizationId: string, id: string, dto: Partial<CreateExpenseDto>) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.incurredAt) {
      const d = new Date(dto.incurredAt);
      update.incurredAt = d;
      update.year = d.getFullYear();
      update.month = d.getMonth() + 1;
    }
    return this.repo.updateById(organizationId, id, update as never);
  }

  remove(organizationId: string, id: string) {
    return this.repo.deleteById(organizationId, id);
  }
}
