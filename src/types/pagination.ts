export interface PaginationMeta {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

export interface PaginatedResult<T> {
    items: T[]
    pagination: PaginationMeta
}