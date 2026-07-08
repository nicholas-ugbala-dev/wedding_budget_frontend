import { z } from 'zod';
import { PAYMENT_TYPES_VALUES } from '../types/payment';

export const createPaymentSchema = z.object({
  payment_type:         z.enum(PAYMENT_TYPES_VALUES),
  user_currency_id:     z.string().uuid().optional(),
  wallet_currency_code: z.string().length(3).optional(),
  wallet_amount:        z.number().positive('Amount must be greater than 0'),
  exchange_rate:        z.number().positive().optional(),
  base_amount:          z.number().positive().optional(),
  payment_date:         z.string().min(1, 'Payment date is required'),
  notes:                z.string().optional(),
})

export const updatePaymentSchema = z.object({
  payment_type:         z.enum(PAYMENT_TYPES_VALUES).optional(),
  user_currency_id:     z.string().uuid().optional(),
  wallet_currency_code: z.string().length(3).optional(),
  wallet_amount:        z.number().positive().optional(),
  exchange_rate:        z.number().positive().nullable().optional(),
  base_amount:          z.number().positive().optional(),
  payment_date:         z.string().min(1).optional(),
  notes:                z.string().nullable().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;