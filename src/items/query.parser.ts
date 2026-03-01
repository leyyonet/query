import { isEmpty, isFilledObj, isText, setFqn, testCase } from "@leyyo/common";
import { OperationType, OperationTypeItems, OperationTypeMap } from "../literal/index.js";
import {
  FieldAs,
  FieldRaw,
  FieldRegular,
  GroupBy,
  GroupByAny,
  GroupByGivenRaw,
  GroupByGivenRegular,
  OrderBy,
  OrderByAny,
  OrderByGiven,
  OrderByGivenAsc,
  OrderByGivenRaw,
  PaginationAny,
  PaginationLimit,
  PaginationPage,
  QueryAny,
  QueryParserLike,
  QueryRegular,
  Select,
  SelectAny,
  SelectGiven,
  SelectGivenRaw,
  Where,
  WhereAny,
  WhereGiven,
  WhereGivenCondition,
  WhereGivenRaw,
} from "../type.js";
import { InvalidQueryValueError } from "../error/index.js";
import { PCK } from "../internal.js";

class QueryParser implements QueryParserLike {
  // region private
  private _asc(value: unknown, path: string): boolean {
    if (isEmpty(value)) {
      return true;
    }
    if (typeof value === "boolean") {
      return value as boolean;
    } else if (isText(value)) {
      if ((value as string).toLowerCase() === "asc") {
        return true;
      } else if ((value as string).toLowerCase() === "desc") {
        return false;
      }
    }
    throw new InvalidQueryValueError(`Order type should be valid`, {
      case: testCase(PCK, 110),
      path,
      expected: ["true", "false", "asc", "desc"],
      type: typeof value,
      value,
    });
  }

  private _field<K extends string>(value: unknown, path: string): K {
    if (isText(value)) {
      return value as K;
    }
    throw new InvalidQueryValueError(`Field should be valid text`, {
      case: testCase(PCK, 100),
      path,
      expected: "string",
      type: typeof value,
      value,
    });
  }
  private _raw(value: unknown, path: string): string {
    if (isText(value)) {
      return value as string;
    }
    throw new InvalidQueryValueError(`Raw data should be valid text`, {
      case: testCase(PCK, 101),
      path,
      expected: "string",
      type: typeof value,
      value,
    });
  }
  private _as(value: unknown, path: string): string {
    if (isEmpty(value)) {
      return undefined;
    } else if (isText(value)) {
      return value as string;
    }
    throw new InvalidQueryValueError(`As command should be valid text`, {
      case: testCase(PCK, 120),
      path,
      expected: "string",
      type: typeof value,
      value,
    });
  }
  private _operation(value: unknown, path: string): OperationType {
    if (isEmpty(value)) {
      return "eq";
    } else if (isText(value)) {
      const key = value as string;
      if (isText(key) && OperationTypeItems.includes(key as OperationType)) {
        return key as OperationType;
      }
      if (OperationTypeMap[key] !== undefined) {
        return OperationTypeMap[key];
      }
    }
    throw new InvalidQueryValueError(`Operation command should be valid`, {
      case: testCase(PCK, 130),
      path,
      expected: "@see operations",
      type: typeof value,
      value,
    });
  }
  private _value(value: unknown, path: string): Array<unknown> {
    if (value === undefined) {
      return [];
    }
    switch (typeof value) {
      case "string":
        if (!isText(value)) {
          throw new InvalidQueryValueError(`Value should not be empty or spaced string`, {
            case: testCase(PCK, 131),
            path,
            expected: "string",
            type: typeof value,
            value,
          });
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
            if (!isText(item) && typeof value !== "number" && typeof value !== "boolean") {
              throw new InvalidQueryValueError(`Value should be string, number or boolean`, {
                case: testCase(PCK, 132),
                path,
                expected: ["string", "number", "boolean"],
                type: typeof item,
                item,
                index,
              });
            }
            index++;
          }
          return value;
        }
        break;
    }
    throw new InvalidQueryValueError(`Value should be valid`, {
      case: testCase(PCK, 133),
      path,
      expected: ["string", "number", "boolean", "array", "number"],
      type: typeof value,
      value,
    });
  }
  private _num(value: unknown, path: string, min: number): number {
    if (isEmpty(value)) {
      return undefined;
    } else if (Number.isSafeInteger(value)) {
      if ((value as number) >= min) {
        return value as number;
      }
      throw new InvalidQueryValueError(`It should be ${min} as minimum`, {
        case: testCase(PCK, 102),
        path,
        min,
        value,
      });
    }
    throw new InvalidQueryValueError(`Value should be numeric`, {
      case: testCase(PCK, 103),
      path,
      expected: "number",
      type: typeof value,
      value,
    });
  }
  private _fieldXorRaw(field: unknown, raw: unknown, path: string): void {
    if (!raw && !field) {
      throw new InvalidQueryValueError(`Field or raw are not provided, one of them should be`, {
        case: testCase(PCK, 104),
        path,
      });
    } else if (raw && field) {
      throw new InvalidQueryValueError(
        `Field and raw are provided together, Field or raw are not provided, only one of them should be`,
        {
          case: testCase(PCK, 105),
          path,
          raw,
          field: field as string,
        },
      );
    }
  }
  // endregion private

  // region parts
  protected _select<K extends string>(
    given: SelectAny<K>,
    _availableFields: Array<K | string>,
    _name: string,
  ): Select<K> {
    if (isEmpty(given)) {
      return { all: true };
    }
    // Cases:
    // 1 - '*'
    // 2 - Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>

    // case 1: string as K
    if (given === "*") {
      return { all: true };
    }

    const newSelect: Select<K> = { fields: [] };

    // case 2: Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>
    if (Array.isArray(given)) {
      if (given.length < 1) {
        return { all: true };
      }
      const arr = given as Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>;
      arr.forEach((item, index) => {
        // Case 2A: K
        if (isText(item)) {
          newSelect.fields.push({
            field: item as K,
          });
        }
        // Case 2B: [K, string]
        else if (Array.isArray(item)) {
          let [field, as] = item as [K, string];
          field = this._field(field, `select[${index}][0]`);
          as = this._as(as, `select[${index}][1]`);
          newSelect.fields.push({ field, as });
        }
        // Case 2C: SelectGiven<K> | SelectGivenRaw
        else if (isFilledObj(item)) {
          let field: K;
          let raw: string;

          const obj = item as SelectGiven<K> | SelectGivenRaw;
          if (!isEmpty((obj as FieldRaw).raw)) {
            raw = this._raw((obj as FieldRaw).raw, `select[${index}].raw`);
          }
          if (!isEmpty((obj as FieldRegular<K>).field)) {
            field = this._field((obj as FieldRegular<K>).field, `select[${index}].field`);
          }

          this._fieldXorRaw(field, raw, `select[${index}].field`);

          const as = this._as((obj as FieldAs).as, `select[${index}].as`);

          if (field) {
            newSelect.fields.push({ field, as });
          } else {
            newSelect.fields.push({ raw, as });
          }
        }
        // other
        else {
          throw new InvalidQueryValueError(`Invalid select item`, {
            case: testCase(PCK, 121),
            path: `select[${index}]`,
            expected: ["string", "array", "object"],
            type: typeof item,
            value: item,
            index,
          });
        }
      });
    }

    // case: other
    else {
      throw new InvalidQueryValueError(`Invalid select block`, {
        case: testCase(PCK, 122),
        path: "select",
        expected: ["*", "array"],
        type: typeof given,
        value: given,
      });
    }
    return newSelect;
  }

  protected _where<K extends string>(
    scope: "where" | "having",
    given: WhereAny<K>,
    _availableFields: Array<K | string>,
    _name: string,
  ): Where<K> {
    if (isEmpty(given)) {
      return [];
    }
    // Cases:
    // 1 - WhereValue<K>
    // 2 - Array<WhereGiven<K>|WhereGivenRaw|[K, unknown]>
    const newWhere: Where<K> = [];

    // case 1: WhereValue<K>
    if (isFilledObj(given)) {
      let index = 0;
      for (const [k, v] of Object.entries(given)) {
        const field = this._field(k, `${scope}(key=${index})`) as K;
        const value = this._value(v, `${scope}.${field}`);
        newWhere.push({ field, value, op: "eq" });
        index++;
      }
    }

    // case 2: array as Array<WhereGiven<K>|WhereGivenRaw|[K, unknown]>
    else if (Array.isArray(given)) {
      if (given.length < 1) {
        return [];
      }
      const arr = given as Array<WhereGiven<K> | WhereGivenRaw | [K, unknown]>;
      arr.forEach((item, index) => {
        // Case 2A: WhereGiven<K>|WhereGivenRaw
        if (isFilledObj(item)) {
          let field: K;
          let raw: string;
          let fullRaw: true;

          const obj = item as WhereGiven<K> | WhereGivenRaw;
          if (!isEmpty((obj as FieldRaw).raw)) {
            raw = this._raw((obj as OrderByGivenRaw).raw, `${scope}[${index}].raw`);
          }
          if (!isEmpty((obj as FieldRegular<K>).field)) {
            field = this._field((obj as FieldRegular<K>).field, `${scope}[${index}].field`);
          }

          this._fieldXorRaw(field, raw, `${scope}[${index}].field`);

          const whereItem = obj as WhereGivenCondition;
          if (raw && isEmpty(whereItem.op) && isEmpty(whereItem.value)) {
            fullRaw = true;
          }
          const op = this._operation(whereItem.op, `${scope}[${index}].op`);
          const value: Array<unknown> = this._value(whereItem.value, `${scope}[${index}].value`);

          if (field) {
            newWhere.push({ field, op, value });
          } else {
            newWhere.push({ raw, op, value, fullRaw });
          }
        }

        // Case 2B: |[K, unknown]
        else if (Array.isArray(item) && item.length > 0) {
          const field: K = this._field(item[0], `${scope}[${index}][0]`);
          const value: Array<unknown> = this._value(item[1], `${scope}[${index}][1]`);
          newWhere.push({ field, value, op: "eq" });
        } else {
          throw new InvalidQueryValueError(`Invalid ${scope} item`, {
            case: testCase(PCK, scope === "where" ? 134 : 144),
            path: `${scope}[${index}]`,
            expected: ["object", "array"],
            type: typeof item,
            value: item,
            index,
          });
        }
      });
    }
    // case: other
    else {
      throw new InvalidQueryValueError(`Invalid ${scope} block`, {
        case: testCase(PCK, scope === "where" ? 135 : 145),
        path: scope,
        expected: ["object", "array"],
        type: typeof given,
        value: given,
      });
    }
    return newWhere;
  }

  protected _groupBy<K extends string>(
    given: GroupByAny<K>,
    _availableFields: Array<K | string>,
    _name: string,
  ): GroupBy<K> {
    if (isEmpty(given)) {
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
        if (isFilledObj(item)) {
          let field: K;
          let raw: string;

          const obj = item as GroupByGivenRegular<K> | GroupByGivenRaw;
          if (!isEmpty((obj as FieldRaw).raw)) {
            raw = this._raw((obj as FieldRaw).raw, `groupBy[${index}].raw`);
          }
          if (!isEmpty((obj as FieldRegular<K>).field)) {
            field = this._field((obj as FieldRegular<K>).field, `groupBy[${index}].field`);
          }

          this._fieldXorRaw(field, raw, `groupBy[${index}].field`);

          if (field) {
            newGroup.push({ field });
          } else {
            newGroup.push({ raw });
          }
        }

        // Case 2B: K
        else if (isText(item)) {
          newGroup.push({ field: item as K });
        } else {
          throw new InvalidQueryValueError(`Invalid group by item`, {
            case: testCase(PCK, 150),
            path: `groupBy[${index}]`,
            expected: ["string", "object"],
            type: typeof item,
            value: item,
            index,
          });
        }
      });
    }
    // case: other
    else {
      throw new InvalidQueryValueError(`Invalid group by block`, {
        case: testCase(PCK, 151),
        path: "groupBy",
        expected: ["array"],
        type: typeof given,
        value: given,
      });
    }
    return newGroup;
  }

  protected _orderBy<K extends string>(
    given: OrderByAny<K>,
    _availableFields: Array<K | string>,
    _name: string,
  ): OrderBy<K> {
    if (isEmpty(given)) {
      return [];
    }
    // Cases:
    // 1 - K
    // 2 - Array<OrderByGiven<K>|K|OrderByGivenRaw>
    // 3 - OrderByValue<K>
    const newOrder: OrderBy<K> = [];

    // case 1: string as K
    if (isText(given)) {
      newOrder.push({ field: given as K, asc: true });
    }

    // case 2: array as Array<OrderByGiven<K>|K|OrderByGivenRaw>
    else if (Array.isArray(given)) {
      if (given.length < 1) {
        return [];
      }
      const arr = given as Array<OrderByGiven<K> | K | OrderByGivenRaw>;
      arr.forEach((item, index) => {
        // Case 2A: OrderByGiven<K>|OrderByGivenRaw
        if (isFilledObj(item)) {
          let field: K;
          let raw: string;

          const obj = item as OrderByGiven<K> | OrderByGivenRaw;
          if (!isEmpty((obj as FieldRaw).raw)) {
            raw = this._raw((obj as OrderByGivenRaw).raw, `orderBy[${index}].raw`);
          }
          if (!isEmpty((obj as FieldRegular<K>).field)) {
            field = this._field((obj as OrderByGiven<K>).field, `orderBy[${index}].field`);
          }

          this._fieldXorRaw(field, raw, `orderBy[${index}].field`);

          const asc = this._asc((obj as OrderByGivenAsc).asc, `orderBy[${index}].asc`);

          if (field) {
            newOrder.push({ field, asc });
          } else {
            newOrder.push({ raw, asc });
          }
        }
        // Case 2B: K
        else if (isText(item)) {
          newOrder.push({ field: this._field(item, ""), asc: true });
        }
        // other
        else {
          throw new InvalidQueryValueError(`Invalid order by item`, {
            case: testCase(PCK, 111),
            path: `orderBy[${index}]`,
            expected: ["string", "object"],
            type: typeof item,
            value: item,
            index,
          });
        }
      });
    }
    // case 3: {'id': true, name: true, ...} as OrderByValue<K>
    else if (isFilledObj(given)) {
      let index = 0;
      for (const [k, v] of Object.entries(given)) {
        const field = this._field(k, `orderBy(key=${index})`) as K;
        const asc = this._asc(v, `orderBy.${field}`);
        newOrder.push({ field, asc });
        index++;
      }
    }

    // case: other
    else {
      throw new InvalidQueryValueError(`Invalid order by block`, {
        case: testCase(PCK, 112),
        path: "orderBy",
        expected: ["string", "array", "object"],
        type: typeof given,
        value: given,
      });
    }
    return newOrder;
  }

  protected _pagination(given: PaginationAny, _name: string): PaginationLimit {
    if (isEmpty(given)) {
      return {};
    }
    // Case 1: PaginationLiteral
    if (Array.isArray(given)) {
      if (given.length < 1) {
        return {};
      }
      return {
        limit: this._num(given[0], `pagination[0]`, 1),
        offset: this._num(given[1], `pagination[1]`, 0),
      };
    }
    // Case 2: PaginationPage | PaginationLimit
    else if (isFilledObj(given)) {
      if (Object.keys(given).length < 1) {
        return {};
      }
      const obj = given as PaginationPage & PaginationLimit;
      if (!isEmpty(obj.page)) {
        const page = this._num(obj.page, `pagination.page`, 1);
        const size = this._num(obj.size, `pagination.size`, 1) ?? 50;
        ["limit", "offset"].forEach((f) => {
          if (!isEmpty(given[f])) {
            throw new InvalidQueryValueError(
              `If you give page; limit and offset can not be used anymore`,
              {
                case: testCase(PCK, 160),
                path: "pagination",
                value: given,
              },
            );
          }
        });
        return {
          limit: size,
          offset: (page - 1) * size,
        };
      }
      if (!isEmpty(obj.limit)) {
        ["page", "size"].forEach((f) => {
          if (!isEmpty(obj[f])) {
            throw new InvalidQueryValueError(
              `If you give limit; page and size can not be used anymore`,
              {
                case: testCase(PCK, 161),
                path: "pagination",
                value: given,
              },
            );
          }
        });
        return {
          limit: this._num(obj.limit, `pagination.limit`, 1),
          offset: this._num(obj.offset, `pagination.offset`, 0),
        };
      }
      throw new InvalidQueryValueError(`Pagination should have limit/offset or page/size keys`, {
        case: testCase(PCK, 162),
        path: "pagination",
        value: given,
      });
    }
    throw new InvalidQueryValueError(`Invalid pagination block`, {
      case: testCase(PCK, 163),
      path: "pagination",
      expected: ["array", "object"],
      type: typeof given,
      value: given,
    });
  }
  // endregion parts

  exec<K extends string>(
    query: QueryAny<K>,
    availableFields: Array<K | string>,
    name?: string,
  ): QueryRegular<K> {
    return {
      select: this._select(query?.select, availableFields, name),
      where: this._where("where", query?.where, availableFields, name),
      having: this._where("having", query?.having, availableFields, name),
      groupBy: this._groupBy(query?.groupBy, availableFields, name),
      orderBy: this._orderBy(query?.orderBy, availableFields, name),
      pagination: this._pagination(query?.pagination, name),
    };
  }
}
setFqn(QueryParser, PCK);

// noinspection JSUnusedGlobalSymbols
export const queryParser: QueryParserLike = new QueryParser();
