import type {KeyOf} from "@leyyo/common";
import type {QueryAny, QueryRegular} from "../query";

export interface QueryParserLike {
    exec<T>(query: QueryAny<T>, availableFields: Array<KeyOf<T>|string>, name?: string): QueryRegular<T>;
}
