import {OperationType} from "../operation/index.js";
import {FieldRaw, FieldRegular} from "../field/index.js";

export type WhereValue<K extends string> = {
    [P in K]: unknown;
};
export type WhereAny<K extends string> = WhereValue<K> | Array<WhereGiven<K>|WhereGivenRaw|[K, unknown]>;

export interface WhereGivenCondition {
    op: string | OperationType;
    value?: unknown;
}

export type WhereGiven<K extends string> = FieldRegular<K> & WhereGivenCondition;

export type WhereGivenRaw = FieldRaw & WhereGivenCondition;

export type Where<K extends string> = Array<WhereItemRegular<K>|WhereItemRaw>;

export type WhereItemRegular<K extends string> = FieldRegular<K> & WhereCondition;
export type WhereItemRaw = FieldRaw & WhereCondition;

export interface WhereCondition {
    fullRaw?: true;
    op?: OperationType;
    value?: unknown;
}
