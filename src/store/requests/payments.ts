import { instance } from '@/services/axios';
import * as api from '@/services/api';
import type { CreatePaymentInput, UpdatePaymentInput } from '@/validations/payment';

export const fetchPayments = (params: Record<string, unknown>) =>
    instance.get(api.PAYMENTS, { params }).then(r => r.data.data);

export const fetchPaymentSummary = (params?: { ceremony_id?: string }) => 
    instance.get(api.PAYMENT_SUMMARY, { params }).then(r => r.data.data);

export const fetchPaymentTypes = () => 
    instance.get(api.PAYMENT_TYPES).then(r => r.data.data);

export const createPayment = 
({ expenseId, ...data }: { expenseId: string } & CreatePaymentInput) =>
  instance.post(api.EXPENSE_PAYMENTS(expenseId), data).then(r => r.data.data);

export const updatePayment =
({ expenseId, paymentId, ...data }: { expenseId: string; paymentId: string } & UpdatePaymentInput) =>
  instance.patch(api.UPDATE_PAYMENT(expenseId, paymentId), data).then(r => r.data.data);

export const deletePayment =
({ expenseId, paymentId }: { expenseId: string; paymentId: string }) =>
  instance.delete(api.DELETE_PAYMENT(expenseId, paymentId)).then(r => r.data);