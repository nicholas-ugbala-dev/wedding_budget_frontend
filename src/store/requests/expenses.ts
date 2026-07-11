import { instance } from '@/services/axios';
import * as api from '@/services/api';
import type { CreateExpenseInput, UpdateExpenseInput } from '@/validations/expense';
import type { Expense } from '@/types/expense';

export const fetchExpenses = (params: Record<string, unknown>) =>
    instance.get(api.EXPENSES, { params }).then(r => r.data.data);

export const fetchExpenseById = (id: string) =>
    instance.get(api.EXPENSE_BY_ID(id)).then(r => r.data.data);

export const createExpense = (data: CreateExpenseInput): Promise<Expense> =>
    instance.post(api.EXPENSES, data).then(r => r.data.data);

export const updateExpense = ({ id, ...data }: { id: string } & UpdateExpenseInput) =>
    instance.patch(api.EXPENSE_BY_ID(id), data).then(r => r.data.data);

export const deleteExpense = (id: string) =>
    instance.delete(api.EXPENSE_BY_ID(id)).then(r => r.data);
