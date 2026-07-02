export type NeedsAttentionBadge =
    | 'missing_info'
    | 'no_vendor'
    | 'unconfirmed'
    | 'pending_refund'
    | 'unpaid'
    | 'balance_due';


export interface DashboardKpis {
    total_budget: string;
    actual_committed: string;
    total_paid: string;
    outstanding: string;
    over_budget_amount: string;
    pending_refunds: string;
}

export interface DashboardData {
    kpis: DashboardKpis;
    bar_chart: { category: string; actual_amount: string; total_paid: string }[];
    donut_chart: { category: string; amount: string; pct: string }[];
    payment_progress: {
        expense_id: string;
        name: string;
        actual_amount: string;
        total_paid: string;
        balance: string;
        pct: string;
    }[];
    needs_attention: {
        expense_id: string;
        name: string;
        vendor_name: string | null;
        event_name: string | null;
        badge: NeedsAttentionBadge;
    }[];
}