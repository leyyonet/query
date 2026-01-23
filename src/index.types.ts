import {ConditionType} from "./condition";
import {KeyOf, Keys} from "@leyyo/common";

// region order-by

export type OrderType = 'asc'|'desc';
export type OrderByAny<T> = KeyOf<T> | Keys<T> | Array<OrderBy<T>>;

export interface OrderBy<T> {
    field: KeyOf<T>;
    asc: boolean | OrderType;
}
// endregion order-by

// region pagination
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
// endregion pagination

// region where
export type WhereValue<T, K extends keyof T = keyof T> = {
    [P in K]: T[P];
};
export type WhereAny<T> = WhereValue<T> | Array<Where<T>>;

export interface Where<T> {
    field: KeyOf<T>;
    condition?: string | ConditionType;
    value: unknown;
    lambda?: string;
}
// endregion where


// region select
export type SelectAny<T> = '*' | string | Keys<T>;
// endregion select

// region group-by
export type GroupByAny<T> = Keys<T>;
// endregion group-by

// noinspection JSUnusedGlobalSymbols
export interface QueryAny<T = Record<string, unknown>> {
    select: SelectAny<T>;
    where?: WhereAny<T>;
    groupBy?: GroupByAny<T>;
    orderBy?: OrderByAny<T>;
    pagination?: PaginationAny;
}
