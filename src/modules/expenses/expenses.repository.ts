import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantBaseRepository } from '../../common/repositories/tenant-base.repository';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class ExpensesRepository extends TenantBaseRepository<ExpenseDocument> {
  constructor(@InjectModel(Expense.name) model: Model<ExpenseDocument>) {
    super(model);
  }
}
