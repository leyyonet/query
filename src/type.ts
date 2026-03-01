import { OperationType, OrderType } from "./literal/index.js";
import { BasicType } from "@leyyo/common";

// region field
export interface FieldRegular<K extends string> {
  field: K;
}
export interface FieldRaw {
  raw: string;
}
export interface FieldAs {
  as?: string;
}
// endregion field

// region group-by
export type GroupByAny<K extends string> = Array<K | GroupByGivenRegular<K> | GroupByGivenRaw>;
export type GroupByGivenRegular<K extends string> = FieldRegular<K>;
export type GroupByGivenRaw = FieldRaw;

export type GroupBy<K extends string> = Array<GroupByItemRegular<K> | GroupByItemRaw>;
export type GroupByItemRegular<K extends string> = FieldRegular<K>;
export type GroupByItemRaw = FieldRaw;
// endregion group-by

// region order-by
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

export type PaginationLiteral = [number?, number?]; // [limit, offset]
// endregion pagination

// region parser
export interface QueryParserLike {
  exec<K extends string>(
    query: QueryAny<K>,
    availableFields: Array<K | string>,
    name?: string,
  ): QueryRegular<K>;
}

export type QueryValueType = BasicType | "array" | "null" | "integer" | "*";
// endregion parser

// region query
export interface QueryAny<K extends string> {
  select?: SelectAny<K>;
  where?: WhereAny<K>;
  having?: WhereAny<K>;
  groupBy?: GroupByAny<K>;
  orderBy?: OrderByAny<K>;
  pagination?: PaginationAny;
}

export interface QueryRegular<K extends string> {
  select: Select<K>;
  where: Where<K>;
  having: Where<K>;
  groupBy: GroupBy<K>;
  orderBy: OrderBy<K>;
  pagination: PaginationLimit;
}
// endregion query

// region select
export type SelectAny<K extends string> =
  | "*"
  | Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>;
export type SelectGiven<K extends string> = FieldRegular<K> & FieldAs;

export type SelectGivenRaw = FieldRaw & FieldAs;

export interface Select<K extends string> {
  all?: true;
  fields?: Array<SelectItemRegular<K> | SelectItemRaw>;
}

export type SelectItemRegular<K extends string> = FieldRegular<K> & FieldAs;
export type SelectItemRaw = FieldRaw & FieldAs;
// endregion select

// region where
export type WhereValue<K extends string> = {
  [P in K]: unknown;
};
export type WhereAny<K extends string> =
  | WhereValue<K>
  | Array<WhereGiven<K> | WhereGivenRaw | [K, unknown]>;

export interface WhereGivenCondition {
  op: string | OperationType;
  value?: unknown;
}

export type WhereGiven<K extends string> = FieldRegular<K> & WhereGivenCondition;

export type WhereGivenRaw = FieldRaw & WhereGivenCondition;

export type Where<K extends string> = Array<WhereItemRegular<K> | WhereItemRaw>;

export type WhereItemRegular<K extends string> = FieldRegular<K> & WhereCondition;
export type WhereItemRaw = FieldRaw & WhereCondition;

export interface WhereCondition {
  fullRaw?: true;
  op?: OperationType;
  value?: unknown;
}
// endregion where
