import type {KeyOf} from "@leyyo/common";
import type {FieldRaw, FieldRegular} from "../field";

export type OrderType = 'asc'|'desc';
export type OrderByAny<T> = KeyOf<T> | Array<OrderByGiven<T>|KeyOf<T>|OrderByGivenRaw> | OrderByValue<T>;
export type OrderByValue<T, K extends keyof T = keyof T> = {
    [P in K]: boolean;
};

export interface OrderByGivenAsc {
    asc?: boolean | OrderType;
}

export interface OrderAscRegular {
    asc: boolean;
}

export type OrderByGiven<T> = FieldRegular<T> & OrderByGivenAsc;

export type OrderByGivenRaw = FieldRaw & OrderByGivenAsc;


export type OrderByItem<T> = FieldRegular<T> & OrderAscRegular;
export type OrderByRaw = FieldRaw & OrderAscRegular;

export type OrderBy<T> = Array<OrderByItem<T>|OrderByRaw>;
