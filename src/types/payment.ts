export const PAYMENT_TYPES_VALUES = ['deposit', 'balance', 'full_payment'] as const;
export type PaymentType = (typeof PAYMENT_TYPES_VALUES)[number];

export interface Payment {
    id: string;
    expense_id: string;
    payment_type: PaymentType;
    user_currency_id: string | null;
    wallet_currency_code: string;
    wallet_amount: string
    exchange_rate: string | null;
    base_amount: string;
    payment_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaymentSummary {
    total_paid: string;
    outstanding: string;
    fully_paid_count: number;
    total_expenses: number;
}

export interface PaymentListItem {
  id: string
  expense_id: string
  expense_name: string
  event_id: string
  event_name: string
  vendor_name: string | null
  payment_type: PaymentType
  wallet_currency_code: string
  wallet_amount: string
  exchange_rate: string | null
  base_amount: string
  expense_base_currency: string
  reporting_currency_code: string | null
  reporting_amount: string | null
  payment_date: string
  notes: string | null
  created_at: string
}