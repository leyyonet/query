export type PaginationAny = PaginationPage | PaginationLimit | PaginationLiteral;

export interface PaginationPage {
    page?: number;
    size?: number;
}

export interface PaginationLimit {
    limit?: number;
    offset?: number;
}

export type PaginationLiteral = [number?, number?] // [limit, offset]
