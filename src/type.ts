import { OperationType, OrderType } from "./literal/index.js";

// region field
type FLD = string;
type ALS = string | symbol;
export interface FieldRegular<F extends FLD, A extends ALS, S extends string> {
  field: QF<F, A, S>;
}
export type FieldRawValue = string;
export interface FieldRaw {
  raw: FieldRawValue;
}
export type FieldAsValue = string;
export interface FieldAs {
  as?: FieldAsValue;
}
// endregion field

// region group-by

export type GroupByGiven<F extends FLD, A extends ALS, S extends string> = Array<
  GroupByGivenItem<F, A, S>
>;
export type GroupByGivenItem<F extends FLD, A extends ALS, S extends string> =
  | QF<F, A, S>
  | GroupByGivenItemRegular<F, A, S>
  | GroupByGivenItemRaw;
export type GroupByGivenItemRegular<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
>;
export type GroupByGivenItemRaw = FieldRaw;

export type GroupByFinalItem<F extends FLD, A extends ALS, S extends string> =
  | GroupByFinalItemRegular<F, A, S>
  | GroupByFinalItemRaw;
export type GroupByFinalItemRegular<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
>;
export type GroupByFinalItemRaw = FieldRaw;
export type GroupByFinal<F extends FLD, A extends ALS, S extends string> = Array<
  GroupByFinalItem<F, A, S>
>;
// endregion group-by

// region order-by
export type OrderByGiven<F extends FLD, A extends ALS, S extends string> =
  | QF<F, A, S>
  | Array<OrderByGivenItem<F, A, S>>
  | OrderByGivenMap<F, A, S>;
export type OrderByGivenMap<F extends FLD, A extends ALS, S extends string> = {
  [field in QF<F, A, S>]?: OrderByGivenAscValue;
};

export type OrderByGivenAscValue = boolean | OrderType;
export interface OrderByGivenAsc {
  asc?: OrderByGivenAscValue;
}

export type OrderByGivenItem<F extends FLD, A extends ALS, S extends string> =
  | QF<F, A, S>
  | OrderByGivenItemField<F, A, S>
  | OrderByGivenItemRaw;

export type OrderByGivenItemField<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
> &
  OrderByGivenAsc;

export type OrderByGivenItemRaw = FieldRaw & OrderByGivenAsc;

export interface OrderByFinalAsc {
  asc: boolean;
}
export type OrderByFinalItemField<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
> &
  OrderByFinalAsc;
export type OrderByFinalItemRaw = FieldRaw & OrderByFinalAsc;
export type OrderByFinalItem<F extends FLD, A extends ALS, S extends string> =
  | OrderByFinalItemField<F, A, S>
  | OrderByFinalItemRaw;
export type OrderByFinal<F extends FLD, A extends ALS, S extends string> = Array<
  OrderByFinalItem<F, A, S>
>;
// endregion order-by

// region pagination
export type PaginationGiven = PaginationGivenPage | PaginationGivenLimit | PaginationGivenTuple;

export interface PaginationGivenPage {
  page?: number;
  size?: number;
}

export interface PaginationGivenLimit {
  limit?: number;
  offset?: number;
}

export type PaginationGivenTuple = [number?, number?]; // [limit, offset]

export interface PaginationFinal {
  limit: number;
  offset: number;
}
// endregion pagination
// region shortcut
export type QueryShortcut<S extends string> = {
  [field in S]?: FieldRawValue;
};
// endregion shortcut

// region parser
export interface QueryParserLike {
  exec<F extends FLD = string, A extends ALS = symbol, S extends string = string>(
    query: QueryGiven<F, A, S>,
    availableFields: Array<QF<F, A, S>>,
    aliases?: Array<A>,
    name?: string,
  ): QueryFinal<F, A, S>;
}

// endregion parser

// region query
export interface QueryGiven<F extends FLD, A extends ALS, S extends string> {
  shortcut?: QueryShortcut<S>;
  select?: SelectGiven<F, A, S>;
  where?: WhereGiven<F, A, S>;
  having?: WhereGiven<F, A, S>;
  groupBy?: GroupByGiven<F, A, S>;
  orderBy?: OrderByGiven<F, A, S>;
  pagination?: PaginationGiven;
}
export interface QueryGivenExtended<
  F extends FLD,
  A extends ALS,
  S extends string,
> extends QueryGiven<F, A, S> {
  availableFields: Array<QueryField<F, A, S>>;
}

export interface QueryFinal<F extends FLD, A extends ALS, S extends string> {
  readonly isSub: boolean;
  readonly hasAny: boolean;
  availableFields: Array<QueryField<F, A, S>>;
  shortcut: QueryShortcut<S>;
  select: SelectFinal<F, A, S>;
  where: WhereFinal<F, A, S>;
  having: WhereFinal<F, A, S>;
  groupBy: GroupByFinal<F, A, S>;
  orderBy: OrderByFinal<F, A, S>;
  pagination: PaginationFinal;
}

export type QueryField<F extends FLD, A extends ALS, S extends string> = A extends string
  ? `${A}.${F}` | F | S
  : F | S;
type QF<F extends FLD, A extends ALS, S extends string> = QueryField<F, A, S>;
// endregion query

// region select
export type SelectGivenAll = "*";
export type SelectGiven<F extends FLD, A extends ALS, S extends string> =
  | SelectGivenAll
  | Array<SelectGivenItem<F, A, S>>
  | SelectGivenMap<F, A, S>;

export type SelectGivenMap<F extends FLD, A extends ALS, S extends string> = {
  [field in QF<F, A, S>]?: FieldAsValue | null;
};

export type SelectGivenItem<F extends FLD, A extends ALS, S extends string> =
  | QF<F, A, S>
  | SelectGivenItemTuple<F, A, S>
  | SelectGivenItemField<F, A, S>
  | SelectGivenItemRaw;

export type SelectGivenItemTuple<F extends FLD, A extends ALS, S extends string> = [
  QF<F, A, S>,
  FieldAsValue,
];

export type SelectGivenItemField<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
> &
  FieldAs;

export type SelectGivenItemRaw = FieldRaw & FieldAs;

export interface SelectFinal<F extends FLD, A extends ALS, S extends string> {
  all?: true;
  fields?: Array<SelectFinalItem<F, A, S>>;
}

export type SelectFinalItem<F extends FLD, A extends ALS, S extends string> =
  | SelectFinalItemField<F, A, S>
  | SelectFinalItemRaw;

export type SelectFinalItemField<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
> &
  FieldAs;
export type SelectFinalItemRaw = FieldRaw & FieldAs;
// endregion select

// region where
export type WhereGiven<F extends FLD, A extends ALS, S extends string> =
  | WhereGivenMap<F, A, S>
  | Array<WhereGivenItem<F, A, S>>;

export type WhereValue = unknown;

export type WhereGivenMap<F extends FLD, A extends ALS, S extends string> = {
  [field in QF<F, A, S>]?: WhereValue;
};

export interface WhereGivenCondition {
  op?: string | OperationType;
  value?: WhereValue;
}
export interface WhereGivenOr<F extends FLD, A extends ALS, S extends string> {
  $or: WhereGiven<F, A, S>;
}
export interface WhereGivenAnd<F extends FLD, A extends ALS, S extends string> {
  $and: WhereGiven<F, A, S>;
}
export type WhereGivenItem<F extends FLD, A extends ALS, S extends string> =
  | WhereGivenOr<F, A, S>
  | WhereGivenAnd<F, A, S>
  | WhereGivenItemField<F, A, S>
  | WhereGivenItemRaw
  | WhereGivenItemTuple<F, A, S>;

export type WhereGivenItemField<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
> &
  WhereGivenCondition;

export type WhereGivenItemRaw = FieldRaw & WhereGivenCondition;

export type WhereGivenItemTuple<F extends FLD, A extends ALS, S extends string> = [
  QF<F, A, S>,
  WhereValue,
];

export interface WhereFinalItemOr<F extends FLD, A extends ALS, S extends string> {
  $or: WhereFinal<F, A, S>;
}
export interface WhereFinalItemAnd<F extends FLD, A extends ALS, S extends string> {
  $and: WhereFinal<F, A, S>;
}

export type WhereFinal<F extends FLD, A extends ALS, S extends string> = Array<
  WhereFinalItem<F, A, S>
>;
export type WhereFinalItem<F extends FLD, A extends ALS, S extends string> =
  | WhereFinalItemOr<F, A, S>
  | WhereFinalItemAnd<F, A, S>
  | WhereFinalItemRegular<F, A, S>
  | WhereFinalItemRaw;

export type WhereFinalItemRegular<F extends FLD, A extends ALS, S extends string> = FieldRegular<
  F,
  A,
  S
> &
  WhereFinalCondition;
export type WhereFinalItemRaw = FieldRaw & WhereFinalCondition;

export interface WhereFinalCondition {
  fullRaw?: true;
  op?: OperationType;
  value?: Array<WhereValue>;
}
// endregion where
