import type {Select, SelectAny} from "../select";
import type {Where, WhereAny} from "../where";
import type {GroupBy, GroupByAny} from "../group-by";
import type {OrderBy, OrderByAny} from "../order-by";
import type {PaginationAny, PaginationLimit} from "../pagination";

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
