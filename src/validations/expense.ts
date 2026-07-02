
import { z } from 'zod';

export const createExpenseSchema = z.object({
  name:             z.string().min(1, 'Expense name is required'),
  ceremony_id:      z.uuid(),
  category_id:      z.uuid().optional(),
  category_name:    z.string().optional(),
  vendor_id:        z.uuid().optional(),
  vendor_name:      z.string().optional(),
  vendor_phone:     z.string().optional(),
  vendor_email:     z.email().optional().or(z.literal('')),
  actual_amount:    z.number().int().nonnegative().optional(),
  planned_amount:   z.number().int().nonnegative().optional(),
  payment_deadline: z.string().optional(),
  is_planned:       z.boolean().default(false),
  notes:            z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;