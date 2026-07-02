export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    base_currency: string;
    wedding_location: string | null;
    event_name: string | null;
    event_date: string | null;
    account_type: 'couple' | 'planner';
    created_at: string;
}