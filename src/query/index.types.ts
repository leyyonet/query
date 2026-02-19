import { Select, SelectAny } from "../select/index.js";
import { Where, WhereAny } from "../where/index.js";
import { GroupBy, GroupByAny } from "../group-by/index.js";
import { OrderBy, OrderByAny } from "../order-by/index.js";
import { PaginationAny, PaginationLimit } from "../pagination/index.js";

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
