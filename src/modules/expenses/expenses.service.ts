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
}
