import type {KeyOf} from "@leyyo/common";
import type {ConditionType} from "../condition";
import type {FieldRaw, FieldRegular} from "../field";

export type WhereValue<T, K extends keyof T = keyof T> = {
    [P in K]: T[P];
};
export type WhereAny<T> = WhereValue<T> | Array<WhereGiven<T>|WhereGivenRaw|[KeyOf<T>, unknown]>;

export interface WhereGivenCondition {
    eq?: string | ConditionType;
    condition?: string | ConditionType;
    value: unknown;
}


export type WhereGiven<T> = FieldRegular<T> & WhereGivenCondition;

export type WhereGivenRaw = FieldRaw & WhereGivenCondition;

export type Where<T> = Array<WhereItemRegular<T>|WhereItemRaw>;

export type WhereItemRegular<T> = FieldRegular<T> & WhereCondition;
export type WhereItemRaw = FieldRaw & WhereCondition;

export interface WhereCondition {
    fullRaw?: true;
    condition?: ConditionType;
    value?: unknown;
}
