import type {ConditionType} from "../condition";
import type {FieldRaw, FieldRegular} from "../field";

export type WhereValue<K extends string> = {
    [P in K]: unknown;
};
export type WhereAny<K extends string> = WhereValue<K> | Array<WhereGiven<K>|WhereGivenRaw|[K, unknown]>;

export interface WhereGivenCondition {
    eq: string | ConditionType;
    value?: unknown;
}

export type WhereGiven<K extends string> = FieldRegular<K> & WhereGivenCondition;

export type WhereGivenRaw = FieldRaw & WhereGivenCondition;

export type Where<K extends string> = Array<WhereItemRegular<K>|WhereItemRaw>;

export type WhereItemRegular<K extends string> = FieldRegular<K> & WhereCondition;
export type WhereItemRaw = FieldRaw & WhereCondition;

export interface WhereCondition {
    fullRaw?: true;
    eq?: ConditionType;
    value?: unknown;
}
