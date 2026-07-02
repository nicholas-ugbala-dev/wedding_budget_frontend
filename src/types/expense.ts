import { type Payment } from './payment';
export type ExpenseStatus = 'unpaid' | 'paid' | 'pending';

export interface Expense {
    id: string;
    name: string;
    ceremony_id: string;
    ceremony_name: string;
    category_id: string;
    category_name: string;
    vendor_id: string | null;
    vendor_name: string | null;
    planned_amount: number | null;
    actual_amount: number | null;
    base_currency: string;
    refundable_amount: number;
    is_refundded: boolean;
    refunded_at: string | null;
    is_planned: boolean;
    payment_deadline: string | null;
    notes: string | null;
    total_paid: number;
    balance: number;
    status: ExpenseStatus;
    created_at: string;
    updated_at: string;
}

export interface ExpenseDetail extends Expense {
    payments: Payment[];
}