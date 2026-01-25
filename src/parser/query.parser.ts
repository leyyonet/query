import {$is, type OneOrMore} from "@leyyo/common";
import {type ConditionType, ConditionTypeItems, ConditionTypeMap} from "../condition";
import type {QueryParserLike, QueryValueType} from "./index.types";
import type {Select, SelectAny, SelectGiven, SelectGivenRaw} from "../select";
import type {GroupBy, GroupByAny, GroupByGivenRaw, GroupByGivenRegular} from "../group-by";
import type {OrderBy, OrderByAny, OrderByGiven, OrderByGivenAsc, OrderByGivenRaw} from "../order-by";
import type {Where, WhereAny, WhereGiven, WhereGivenCondition, WhereGivenRaw} from "../where";
import type {PaginationAny, PaginationLimit, PaginationPage} from "../pagination";
import type {QueryAny, QueryRegular} from "../query";
import type {FieldAs, FieldRaw, FieldRegular} from "../field";
import {InvalidQueryValueError, type QueryErrorCode} from "../error";

class QueryParser implements QueryParserLike {

    // region private
    private _error(code: QueryErrorCode, message: string, path: string): InvalidQueryValueError {
        return new InvalidQueryValueError(code, message, path);
    }
    private _invalid(value: unknown, path: string, expected: OneOrMore<QueryValueType>, code: QueryErrorCode): InvalidQueryValueError {
        const ex = Array.isArray(expected) ? `[${expected.join(', ')}]` : expected;
        return this._error(code, `It's expected as ${ex}, but it's type: ${typeof value}`, path);
    }

    private _emptyOrInvalid(value: unknown, path: string, expected: OneOrMore<QueryValueType>, empty: QueryErrorCode, invalid: QueryErrorCode): InvalidQueryValueError {
        if ($is.empty(value)) {
            return this._error(empty, `It's empty`, path);
        }
        if (typeof value === 'string' && value.trim() === '') {
            return this._error(empty, `It's empty`, path);
        }
        return this._invalid(value, path, expected, invalid);
    }

    private _asc(value: unknown, path: string): boolean {
        if ($is.empty(value)) {
            return true;
        }
        if ($is.boolean(value)) {
            return value as boolean;
        }
        else if ($is.text(value)) {
            if ((value as string).toLowerCase() === 'asc') {
                return true;
            }
            else if ((value as string).toLowerCase() === 'desc') {
                return false;
            }
            throw this._error('asc:invalid-key', `It should be [asc, desc], but it's value: ${value}`, path);
        }
        throw this._invalid(value, path, ['boolean', 'string'], 'asc:invalid-type');
    }

    private _field<K extends string>(value: unknown, path: string): K {
        if ($is.text(value)) {
            return value as K;
        }
        throw this._emptyOrInvalid(value, path, 'string', 'field:empty', 'field:invalid');
    }
    private _raw(value: unknown, path: string): string {
        if ($is.text(value)) {
            return value as string;
        }
        throw this._emptyOrInvalid(value, path, 'string', 'raw:empty', 'raw:invalid');
    }
    private _as(value: unknown, path: string): string {
        if ($is.empty(value)) {
            return undefined;
        }
        else if ($is.text(value)) {
            return value as string;
        }
        throw this._invalid(value, path, 'string', 'as:invalid');
    }
    private _condition(value: unknown, path: string): ConditionType {
        if ($is.empty(value)) {
            return '==';
        }
        else if ($is.text(value)) {
            const key = value as string;
            if ($is.literal(key, ConditionTypeItems)) {
                return key as ConditionType;
            }
            if (ConditionTypeMap[key] !== undefined) {
                return ConditionTypeMap[key];
            }
            throw this._error('eq:invalid-key', `It should be [@see equalities], but it's value: ${value}`, path);
        }
        throw this._invalid(value, path, 'string', 'eq:invalid-type');
    }
    private _value(value: unknown, path: string): Array<unknown> {
        if (value === undefined) {
            return [];
        }
        switch (typeof value) {
            case "string":
                value = value.trim();
                if (!value) {
                    throw this._error('value:invalid-type', `It should not be empty string`, path);
                }
                return [value];
            case "number":
            case "boolean":
                return [value];
            case "object":
                if (value === null) {
                    return [null];
                }
                if (Array.isArray(value)) {
                    let index = 0;
                    for (const item of value) {
                        if (!$is.text(item) && !$is.number(item) && !$is.boolean(value)) {
                            throw this._invalid(item, `${path}[${index}]`, ['string', 'number', 'boolean', 'array', 'number'], 'value:invalid-item');
                        }
                        index++;
                    }
                    return value;
                }
                break;
        }
        throw this._invalid(value, path, ['string', 'number', 'boolean', 'array', 'number'], 'value:invalid-type');
    }
    private _num(value: unknown, path: string, min: number): number {
        if ($is.empty(value)) {
            return undefined;
        }
        else if ($is.integer(value)) {
            if ((value as number) >= min) {
                return value as number;
            }
            throw this._error('integer:min', `It should be gte ${min}`, path);
        }
        throw this._invalid(value, path, ['integer'], 'integer:invalid');
    }
    private _fieldXorRaw(field: unknown, raw: unknown, path: string): void {
        if (!raw && !field) {
            throw this._error('field:raw-none', `Field or raw are not provided, one of them should be`, path);
        }
        else if (raw && field) {
            throw this._error('field:raw-both', `Field and raw are provided together, Field or raw are not provided, only one of them should be`, path);
        }
    }
    // endregion private

    // region parts
    protected _select<K extends string>(given: SelectAny<K>, _availableFields: Array<K|string>, _name: string): Select<K> {
        if ($is.empty(given)) {
            return true;
        }
        // Cases:
        // 1 - '*'
        // 2 - Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>

        // case 1: string as K
        if (given === '*') {
            return true;
        }

        const newSelect: Select<K> = [];

        // case 2: Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>
        if (Array.isArray(given)) {
            if (given.length < 1) {
                return true;
            }
            const arr = given as Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>;
            arr.forEach((item, index) => {
                // Case 2A: K
                if ($is.text(item)) {
                    newSelect.push({
                        field: item as K,
                    });
                }
                // Case 2B: [K, string]
                else if (Array.isArray(item)) {
                    let [field, as] = item as [K, string];
                    field = this._field(field, `select[${index}][0]`);
                    as = this._as(as, `select[${index}][1]`);
                    newSelect.push({field, as,});
                }
                // Case 2C: SelectGiven<K> | SelectGivenRaw
                else if ($is.object(item)) {
                    let as: string;
                    let field: K;
                    let raw: string;

                    const obj = item as SelectGiven<K> | SelectGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as FieldRaw).raw, `select[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<K>).field)) {
                        field = this._field((obj as FieldRegular<K>).field, `select[${index}].field`);
                    }

                    this._fieldXorRaw(field, raw, `select[${index}].field`)

                    as = this._as((obj as FieldAs).as, `select[${index}].as`);

                    if (field) {
                        newSelect.push({field, as});
                    }
                    else {
                        newSelect.push({raw, as});
                    }
                }
                // other
                else {
                    throw this._invalid(item, `select[${index}]`, ['string', 'array', 'object'], 'select:item');
                }
            });
        }

        // case: other
        else {
            throw this._invalid(given, `select`, ['*', 'array'], 'select:body');
        }
        return newSelect;
    }

    protected _where<K extends string>(scope: 'where'|'having', given: WhereAny<K>, _availableFields: Array<K|string>, _name: string): Where<K> {
        if ($is.empty(given)) {
            return [];
        }
        // Cases:
        // 1 - WhereValue<K>
        // 2 - Array<WhereGiven<K>|WhereGivenRaw|[K, unknown]>
        const newWhere: Where<K> = [];

        // case 1: WhereValue<K>
        if ($is.object(given)) {
            let index = 0;
            for (let [k, v] of Object.entries(given)) {
                const field = this._field(k, `${scope}(key=${index})`) as K;
                const value = this._value(v, `${scope}.${field}`);
                newWhere.push({field, value, eq: '=='});
                index++;
            }
        }

        // case 2: array as Array<WhereGiven<K>|WhereGivenRaw|[K, unknown]>
        else if (Array.isArray(given)) {
            if (given.length < 1) {
                return [];
            }
            const arr = given as Array<WhereGiven<K>|WhereGivenRaw|[K, unknown]>;
            arr.forEach((item, index) => {
                // Case 2A: WhereGiven<K>|WhereGivenRaw
                if ($is.object(item)) {
                    let field: K;
                    let raw: string;
                    let eq: ConditionType;
                    let value: Array<unknown>;
                    let fullRaw: true;

                    const obj = item as WhereGiven<K>|WhereGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as OrderByGivenRaw).raw, `${scope}[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<K>).field)) {
                        field = this._field((obj as FieldRegular<K>).field, `${scope}[${index}].field`);
                    }

                    this._fieldXorRaw(field, raw, `${scope}[${index}].field`)

                    const whereItem = obj as WhereGivenCondition;
                    if (raw && $is.empty(whereItem.eq) && $is.empty(whereItem.value)) {
                        fullRaw = true;
                    }
                    eq = this._condition(whereItem.eq, `${scope}[${index}].eq`);
                    value = this._value(whereItem.value, `${scope}[${index}].value`);

                    if (field) {
                        newWhere.push({field, eq, value});
                    }
                    else {
                        newWhere.push({raw, eq, value, fullRaw});
                    }
                }

                // Case 2B: |[K, unknown]
                else if (Array.isArray(item) && item.length > 0) {
                    let field: K;
                    let value: Array<unknown>;
                    field = this._field(item[0], `${scope}[${index}][0]`);
                    value = this._value(item[1], `${scope}[${index}][1]`);
                    newWhere.push({field, value, eq: '=='});
                }
                else {
                    throw this._invalid(item, `${scope}[${index}]`, ['object', 'array'], (scope === 'where') ? 'where:item': 'having:item');
                }
            });
        }
        // case: other
        else {
            throw this._invalid(given, scope, ['object', 'array'], (scope === 'where') ? 'where:body': 'having:body');
        }
        return newWhere;
    }

    protected _groupBy<K extends string>(given: GroupByAny<K>, _availableFields: Array<K|string>, _name: string): GroupBy<K> {
        if ($is.empty(given)) {
            return [];
        }
        // Cases:
        // 1 - Array<K | GroupByGivenRegular<K> | GroupByGivenRaw>
        const newGroup: GroupBy<K> = [];

        // case 1: Array<K | GroupByGivenRegular<K> | GroupByGivenRaw>
        if (Array.isArray(given)) {
            if (given.length < 1) {
                return [];
            }
            const arr = given as Array<K | GroupByGivenRegular<K> | GroupByGivenRaw>;
            arr.forEach((item, index) => {
                // Case 2A: GroupByGivenRegular<K> | GroupByGivenRaw
                if ($is.object(item)) {
                    let field: K;
                    let raw: string;

                    const obj = item as GroupByGivenRegular<K>|GroupByGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as FieldRaw).raw, `groupBy[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<K>).field)) {
                        field = this._field((obj as FieldRegular<K>).field, `groupBy[${index}].field`);
                    }

                    this._fieldXorRaw(field, raw, `groupBy[${index}].field`);

                    if (field) {
                        newGroup.push({field});
                    }
                    else {
                        newGroup.push({raw});
                    }
                }

                // Case 2B: K
                else if ($is.text(item)) {
                    newGroup.push({field: item as K});
                }
                else {
                    throw this._invalid(item, `groupBy[${index}]`, ['string', 'object'], 'groupBy:item');
                }
            });
        }
        // case: other
        else {
            throw this._invalid(given, `groupBy`, ['array'], 'groupBy:body');
        }
        return newGroup;
    }

    protected _orderBy<K extends string>(given: OrderByAny<K>, _availableFields: Array<K|string>, _name: string): OrderBy<K> {
        if ($is.empty(given)) {
            return [];
        }
        // Cases:
        // 1 - K
        // 2 - Array<OrderByGiven<K>|K|OrderByGivenRaw>
        // 3 - OrderByValue<K>
        const newOrder: OrderBy<K> = [];

        // case 1: string as K
        if ($is.text(given)) {
            newOrder.push({field: given as K, asc: true});
        }

        // case 2: array as Array<OrderByGiven<K>|K|OrderByGivenRaw>
        else if (Array.isArray(given)) {
            if (given.length < 1) {
                return [];
            }
            const arr = given as Array<OrderByGiven<K>|K|OrderByGivenRaw>;
            arr.forEach((item, index) => {
                // Case 2A: OrderByGiven<K>|OrderByGivenRaw
                if ($is.object(item)) {
                    let asc: boolean;
                    let field: K;
                    let raw: string;

                    const obj = item as OrderByGiven<K>|OrderByGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as OrderByGivenRaw).raw, `orderBy[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<K>).field)) {
                        field = this._field((obj as OrderByGiven<K>).field, `orderBy[${index}].field`);
                    }

                    this._fieldXorRaw(field, raw, `orderBy[${index}].field`);

                    asc = this._asc((obj as OrderByGivenAsc).asc, `orderBy[${index}].asc`);

                    if (field) {
                        newOrder.push({field, asc});
                    }
                    else {
                        newOrder.push({raw, asc});
                    }
                }
                // Case 2B: K
                else if ($is.text(item)) {
                    newOrder.push({field: this._field(item, ''), asc: true});
                }
                // other
                else {
                    throw this._invalid(item, `orderBy[${index}]`, ['string', 'object'], 'orderBy:item');
                }
            });
        }
        // case 3: {'id': true, name: true, ...} as OrderByValue<K>
        else if ($is.object(given)) {
            let index = 0;
            for (let [k, v] of Object.entries(given)) {
                const field = this._field(k, `orderBy(key=${index})`) as K;
                const asc = this._asc(v, `orderBy.${field}`);
                newOrder.push({field, asc});
                index++;
            }
        }

        // case: other
        else {
            throw this._invalid(given, `orderBy`, ['string', 'array', 'object'], 'orderBy:body');
        }
        return newOrder;
    }

    protected _pagination(given: PaginationAny, _name: string): PaginationLimit {
        if ($is.empty(given)) {
            return {};
        }
        // Case 1: PaginationLiteral
        if (Array.isArray(given)) {
            if (given.length < 1) {
                return {};
            }
            return {
                limit: this._num(given[0], `pagination[0]`, 1),
                offset: this._num(given[1], `pagination[1]`, 0)
            };
        }
        // Case 2: PaginationPage | PaginationLimit
        else if ($is.object(given)) {
            if (Object.keys(given).length < 1) {
                return {};
            }
            const obj = given as PaginationPage & PaginationLimit;
            if (!$is.empty(obj.page)) {
                const page = this._num(obj.page, `pagination.page`, 1);
                const size = this._num(obj.size, `pagination.size`, 1) ?? 50;
                ['limit', 'offset'].forEach(f => {
                    if (!$is.empty(given[f])) {
                        throw this._error('page:conflict', 'If you give page; limit and offset can not be used anymore', `pagination.page`);
                    }
                });
                return {
                    limit: size,
                    offset: (page - 1) * size
                };
            }
            if (!$is.empty(obj.limit)) {
                ['page', 'size'].forEach(f => {
                    if (!$is.empty(obj[f])) {
                        throw this._error('limit:conflict', 'If you give limit; page and size can not be used anymore', `pagination.limit`);
                    }
                });
                return {
                    limit: this._num(obj.limit, `pagination.limit`, 1),
                    offset: this._num(obj.offset, `pagination.offset`, 0)
                };
            }
            throw this._error('pagination:invalid-key', 'Pagination should have limit/offset or page/size keys', 'pagination');
        }
        throw this._invalid(given, 'pagination', ['array', 'object'], 'pagination:invalid-type');
    }
    // endregion parts

    exec<K extends string>(query: QueryAny<K>, availableFields: Array<K|string>, name?: string): QueryRegular<K> {
        return {
          select: this._select(query?.select, availableFields, name),
          where: this._where('where', query?.where, availableFields, name),
          having: this._where('having', query?.having, availableFields, name),
          groupBy: this._groupBy(query?.groupBy, availableFields, name),
          orderBy: this._orderBy(query?.orderBy, availableFields, name),
          pagination: this._pagination(query?.pagination, name),
        };
    }
}

// noinspection JSUnusedGlobalSymbols
export const queryParser: QueryParserLike = new QueryParser();
