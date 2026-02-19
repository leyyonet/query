import { FieldRaw, FieldRegular } from "../field/index.js";
import { OrderType } from "../order-type/index.js";

export type OrderByAny<K extends string> =
  | K
  | Array<OrderByGiven<K> | K | OrderByGivenRaw>
  | OrderByValue<K>;
export type OrderByValue<K extends string> = {
  [field in K]: boolean | OrderType;
};

export interface OrderByGivenAsc {
  asc?: boolean | OrderType;
}

export interface OrderAscRegular {
  asc: boolean;
}

export type OrderByGiven<K extends string> = FieldRegular<K> & OrderByGivenAsc;

export type OrderByGivenRaw = FieldRaw & OrderByGivenAsc;

export type OrderByItem<K extends string> = FieldRegular<K> & OrderAscRegular;
export type OrderByRaw = FieldRaw & OrderAscRegular;

export type OrderBy<K extends string> = Array<OrderByItem<K> | OrderByRaw>;
