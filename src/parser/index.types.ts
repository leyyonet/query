import {QueryAny, QueryRegular} from "../query/index.js";
import {BasicType} from "@leyyo/common";

export interface QueryParserLike {
    exec<K extends string>(query: QueryAny<K>, availableFields: Array<K|string>, name?: string): QueryRegular<K>;
}

export type QueryValueType = BasicType | 'array' | 'null' | 'integer' | '*';
