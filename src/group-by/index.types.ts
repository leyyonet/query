import {FieldRaw, FieldRegular} from "../field/index.js";

export type GroupByAny<K extends string> = Array<K | GroupByGivenRegular<K> | GroupByGivenRaw>;
export type GroupByGivenRegular<K extends string> = FieldRegular<K>;
export type GroupByGivenRaw = FieldRaw;

export type GroupBy<K extends string> = Array<GroupByItemRegular<K>|GroupByItemRaw>;
export type GroupByItemRegular<K extends string> = FieldRegular<K>;
export type GroupByItemRaw = FieldRaw;
