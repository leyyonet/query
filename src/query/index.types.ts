import type {Select, SelectAny} from "../select";
import type {Where, WhereAny} from "../where";
import type {GroupBy, GroupByAny} from "../group-by";
import type {OrderBy, OrderByAny} from "../order-by";
import type {PaginationAny, PaginationLimit} from "../pagination";

export interface QueryAny<T = Record<string, unknown>> {
    select?: SelectAny<T>;
    where?: WhereAny<T>;
    having?: WhereAny<T>;
    groupBy?: GroupByAny<T>;
    orderBy?: OrderByAny<T>;
    pagination?: PaginationAny;
}

export interface QueryRegular<T = Record<string, unknown>> {
    select: Select<T>;
    where: Where<T>;
    having: Where<T>;
    groupBy: GroupBy<T>;
    orderBy: OrderBy<T>;
    pagination: PaginationLimit;
}
