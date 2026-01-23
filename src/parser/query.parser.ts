import {$is, type KeyOf} from "@leyyo/common";
import {type ConditionType, ConditionTypeItems, ConditionTypeMap} from "../condition";
import type {QueryParserLike} from "./index.types";
import type {Select, SelectAny, SelectGiven, SelectGivenRaw} from "../select";
import type {GroupBy, GroupByAny, GroupByGivenRaw, GroupByGivenRegular} from "../group-by";
import type {OrderBy, OrderByAny, OrderByGiven, OrderByGivenAsc, OrderByGivenRaw} from "../order-by";
import type {Where, WhereAny, WhereGiven, WhereGivenCondition, WhereGivenRaw} from "../where";
import type {PaginationAny, PaginationLimit, PaginationPage} from "../pagination";
import type {QueryAny, QueryRegular} from "../query";
import type {FieldAs, FieldRaw, FieldRegular} from "../field";

class QueryParser implements QueryParserLike {

    // region private
    private _error(message: string, path: string): Error {
        return new Error(message + ', ' + path);
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
            throw this._error('Order asc error: invalid string', path);
        }
        throw this._error('Order asc error: invalid string', path);
    }
    private _field<T>(value: unknown, path: string): KeyOf<T> {
        if ($is.text(value)) {
            return value as KeyOf<T>;
        }
        throw this._error('Order asc error: invalid string', path);
    }
    private _raw(value: unknown, path: string): string {
        if ($is.text(value)) {
            return value as string;
        }
        throw this._error('Order asc error: invalid string', path);
    }
    private _as(value: unknown, path: string): string {
        if ($is.empty(value)) {
            return undefined;
        }
        else if ($is.text(value)) {
            return value as string;
        }
        throw this._error('Order asc error: invalid string', path);
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
            throw this._error('Order asc error: invalid string', path);
        }
        throw this._error('Order asc error: invalid string', path);
    }
    private _value(value: unknown, path: string): Array<unknown> {
        if (value === undefined) {
            return [undefined];
        }
        switch (typeof value) {
            case "string":
                return [];
            case "number":
            case "boolean":
                return [value];
            case "object":
                if (value === null) {
                    return [null];
                }
                if (Array.isArray(value) && value.length > 0) {
                    return value;
                }
                break;
        }
        throw this._error('Order asc error: invalid string', path);
    }
    private _num(value: unknown, path: string, min: number): number {
        if ($is.empty(value)) {
            return undefined;
        }
        else if ($is.integer(value) && (value as number) >= min) {
            return value as number;
        }
        throw this._error('Order asc error: invalid string', path);
    }
    private _fieldXorRaw<T>(field: unknown, raw: unknown, path: string): void {
        if (!raw && !field) {
            throw this._error('Order asc error: invalid string', path);
        }
        else if (raw && field) {
            throw this._error('Order asc error: invalid string', path);
        }
    }
    // endregion private

    // region parts
    protected _select<T>(given: SelectAny<T>, _availableFields: Array<KeyOf<T>|string>, name: string): Select<T> {
        if ($is.empty(given)) {
            return true;
        }
        // Cases:
        // 1 - '*'
        // 2 - Array<KeyOf<T> | [KeyOf<T>, string] | SelectGiven<T> | SelectGivenRaw>

        // case 1: string as KeyOf<T>
        if (given === '*') {
            return true;
        }

        const newSelect: Select<T> = [];

        // case 2: Array<KeyOf<T> | [KeyOf<T>, string] | SelectGiven<T> | SelectGivenRaw>
        if (Array.isArray(given)) {
            if (given.length < 1) {
                return true;
            }
            const arr = given as Array<KeyOf<T> | [KeyOf<T>, string] | SelectGiven<T> | SelectGivenRaw>;
            arr.forEach((item, index) => {
                // Case 2A: KeyOf<T>
                if ($is.text(item)) {
                    newSelect.push({
                        field: item as KeyOf<T>,
                    });
                }
                // Case 2B: [KeyOf<T>, string]
                else if (Array.isArray(item)) {
                    let [field, as] = item as [KeyOf<T>, string];
                    field = this._field(field, `select[${index}][0]`);
                    as = this._as(as, `select[${index}][1]`);
                    newSelect.push({field, as,});
                }
                // Case 2C: SelectGiven<T> | SelectGivenRaw
                else if ($is.object(item)) {
                    let as: string;
                    let field: KeyOf<T>;
                    let raw: string;

                    const obj = item as SelectGiven<T> | SelectGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as FieldRaw).raw, `select[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<T>).field)) {
                        field = this._field((obj as FieldRegular<T>).field, `select[${index}].field`);
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
                    throw this._error('Invalid select item', name);
                }
            });
        }

        // case: other
        else {
            throw this._error('Invalid select item', name);
        }
        return newSelect;
    }

    protected _where<T>(scope: 'where'|'having', given: WhereAny<T>, _availableFields: Array<KeyOf<T>|string>, name: string): Where<T> {
        if ($is.empty(given)) {
            return [];
        }
        // Cases:
        // 1 - WhereValue<T>
        // 2 - Array<WhereGiven<T>|WhereGivenRaw|[KeyOf<T>, unknown]>
        const newWhere: Where<T> = [];

        // case 1: WhereValue<T>
        if ($is.object(given)) {
            let index = 0;
            for (let [k, v] of Object.entries(given)) {
                const field = this._field(k, `where(key=${index})`);
                const value = this._value(v, `where.${field}`);
                newWhere.push({field, value, condition: '=='});
                index++;
            }
        }

        // case 2: array as Array<WhereGiven<T>|WhereGivenRaw|[KeyOf<T>, unknown]>
        else if (Array.isArray(given)) {
            if (given.length < 1) {
                return [];
            }
            const arr = given as Array<WhereGiven<T>|WhereGivenRaw|[KeyOf<T>, unknown]>;
            arr.forEach((item, index) => {
                // Case 2A: WhereGiven<T>|WhereGivenRaw
                if ($is.object(item)) {
                    let field: KeyOf<T>;
                    let raw: string;
                    let condition: ConditionType;
                    let value: Array<unknown>;
                    let fullRaw: true;

                    const obj = item as WhereGiven<T>|WhereGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as OrderByGivenRaw).raw, `select[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<T>).field)) {
                        field = this._field((obj as FieldRegular<T>).field, `select[${index}].field`);
                    }

                    this._fieldXorRaw(field, raw, `where[${index}].field`)

                    const whereItem = obj as WhereGivenCondition;
                    if (raw && $is.empty(whereItem.eq ?? whereItem.condition) && $is.empty(whereItem.value)) {
                        fullRaw = true;
                    }
                    condition = this._condition(whereItem.eq ?? whereItem.condition, `select[${index}].condition`);
                    value = this._value(whereItem.value, `select[${index}].value`);

                    if (field) {
                        newWhere.push({field, condition, value});
                    }
                    else {
                        newWhere.push({raw, condition, value, fullRaw});
                    }
                }

                // Case 2B: |[KeyOf<T>, unknown]
                else if (Array.isArray(item) && item.length > 0) {
                    let field: KeyOf<T>;
                    let value: Array<unknown>;
                    field = this._field(item[0], `select[${index}][0]`);
                    value = this._value(item[1], `select[${index}][1]`);
                    newWhere.push({field, value, condition: '=='});
                }
                else {
                    throw this._error('Invalid select item', name);
                }
            });
        }
        // case: other
        else {
            throw this._error('Invalid select item', name);
        }
        return newWhere;
    }

    protected _groupBy<T>(given: GroupByAny<T>, _availableFields: Array<KeyOf<T>|string>, name: string): GroupBy<T> {
        if ($is.empty(given)) {
            return [];
        }
        // Cases:
        // 1 - Array<KeyOf<T> | GroupByGivenRegular<T> | GroupByGivenRaw>
        const newGroup: GroupBy<T> = [];

        // case 1: Array<KeyOf<T> | GroupByGivenRegular<T> | GroupByGivenRaw>
        if (Array.isArray(given)) {
            if (given.length < 1) {
                return [];
            }
            const arr = given as Array<KeyOf<T> | GroupByGivenRegular<T> | GroupByGivenRaw>;
            arr.forEach((item, index) => {
                // Case 2A: GroupByGivenRegular<T> | GroupByGivenRaw
                if ($is.object(item)) {
                    let field: KeyOf<T>;
                    let raw: string;

                    const obj = item as GroupByGivenRegular<T>|GroupByGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as FieldRaw).raw, `groupBy[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<T>).field)) {
                        field = this._field((obj as FieldRegular<T>).field, `groupBy[${index}].field`);
                    }

                    this._fieldXorRaw(field, raw, `groupBy[${index}].field`);

                    if (field) {
                        newGroup.push({field});
                    }
                    else {
                        newGroup.push({raw});
                    }
                }

                // Case 2B: KeyOf<T>
                else if ($is.text(item)) {
                    newGroup.push({field: item as KeyOf<T>});
                }
                else {
                    throw this._error('Invalid select item', name);
                }
            });
        }
        // case: other
        else {
            throw this._error('Invalid select item', name);
        }
        return newGroup;
    }

    protected _orderBy<T>(given: OrderByAny<T>, _availableFields: Array<KeyOf<T>|string>, name: string): OrderBy<T> {
        if ($is.empty(given)) {
            return [];
        }
        // Cases:
        // 1 - KeyOf<T>
        // 2 - Array<OrderByGiven<T>|KeyOf<T>|OrderByGivenRaw>
        // 3 - OrderByValue<T>
        const newOrder: OrderBy<T> = [];

        // case 1: string as KeyOf<T>
        if ($is.text(given)) {
            newOrder.push({field: given as KeyOf<T>, asc: true});
        }

        // case 2: array as Array<OrderByGiven<T>|KeyOf<T>|OrderByGivenRaw>
        else if (Array.isArray(given)) {
            if (given.length < 1) {
                return [];
            }
            const arr = given as Array<OrderByGiven<T>|KeyOf<T>|OrderByGivenRaw>;
            arr.forEach((item, index) => {
                // Case 2A: OrderByGiven<T>|OrderByGivenRaw
                if ($is.object(item)) {
                    let asc: boolean;
                    let field: KeyOf<T>;
                    let raw: string;

                    const obj = item as OrderByGiven<T>|OrderByGivenRaw;
                    if (!$is.empty((obj as FieldRaw).raw)) {
                        raw = this._raw((obj as OrderByGivenRaw).raw, `orderBy[${index}].raw`);
                    }
                    if (!$is.empty((obj as FieldRegular<T>).field)) {
                        field = this._field((obj as OrderByGiven<T>).field, `orderBy[${index}].field`);
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
                // Case 2B: KeyOf<T>
                else if ($is.text(item)) {
                    newOrder.push({field: this._field(item, ''), asc: true});
                }
                // other
                else {
                    throw this._error('Invalid select item', name);
                }
            });
        }
        // case 3: {'id': true, name: true, ...} as OrderByValue<T>
        else if ($is.object(given)) {
            let index = 0;
            for (let [k, v] of Object.entries(given)) {
                const field = this._field(k, `orderBy(key=${index})`);
                const asc = this._asc(v, `orderBy.${field}`);
                newOrder.push({field, asc});
                index++;
            }
        }

        // case: other
        else {
            throw this._error('Invalid select item', name);
        }
        return newOrder;
    }

    protected _pagination(given: PaginationAny, name: string): PaginationLimit {
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
                ['limit', 'offset'].forEach(f => {
                    if (!$is.empty(given[f])) {
                        throw this._error('Invalid select item', name);
                    }
                });
                const page = this._num(obj.page, `pagination.page`, 1);
                const size = this._num(obj.size, `pagination.size`, 1) ?? 50;
                return {
                    limit: size,
                    offset: (page - 1) * size
                };
            }
            if (!$is.empty(obj.limit)) {
                ['page', 'size'].forEach(f => {
                    if (!$is.empty(obj[f])) {
                        throw this._error('Invalid select item', name);
                    }
                });
                return {
                    limit: this._num(obj.limit, `pagination.limit`, 1),
                    offset: this._num(obj.offset, `pagination.offset`, 0)
                };
            }
            throw this._error('Invalid select item', name);
        }
        throw this._error('Invalid select item', name);
    }
    // endregion parts

    exec<T>(query: QueryAny<T>, availableFields: Array<KeyOf<T>|string>, name?: string): QueryRegular<T> {
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
