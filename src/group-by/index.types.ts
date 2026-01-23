import type {KeyOf} from "@leyyo/common";
import type {FieldRaw, FieldRegular} from "../field";

export type GroupByAny<T> = Array<KeyOf<T> | GroupByGivenRegular<T> | GroupByGivenRaw>;
export type GroupByGivenRegular<T> = FieldRegular<T>;
export type GroupByGivenRaw = FieldRaw;

export type GroupBy<T> = Array<GroupByItemRegular<T>|GroupByItemRaw>;
export type GroupByItemRegular<T> = FieldRegular<T>;
export type GroupByItemRaw = FieldRaw;
