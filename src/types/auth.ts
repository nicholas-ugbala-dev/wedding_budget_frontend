export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    base_currency: string;
    account_type: 'couple' | 'planner';
    created_at: string;
}