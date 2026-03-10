import {
  BasicType,
  isEmpty,
  isFilledArr,
  isFilledObj,
  isObj,
  isText,
  Mutable,
  setFqn,
  testCase,
} from "@leyyo/common";
import { OperationType, OperationTypeItems, OperationTypeMap } from "../literal/index.js";
import {
  FieldAs,
  FieldAsValue,
  FieldRaw,
  FieldRawValue,
  FieldRegular,
  GroupByFinal,
  GroupByGiven,
  GroupByGivenItem,
  OrderByFinal,
  OrderByGiven,
  OrderByGivenAsc,
  OrderByGivenItem,
  PaginationFinal,
  PaginationGiven,
  PaginationGivenLimit,
  PaginationGivenPage,
  QueryField,
  QueryFinal,
  QueryGiven,
  QueryGivenExtended,
  QueryParserLike,
  QueryShortcut,
  SelectFinal,
  SelectGiven,
  SelectGivenItem,
  SelectGivenItemTuple,
  WhereFinal,
  WhereFinalCondition,
  WhereFinalItem,
  WhereGiven,
  WhereGivenAnd,
  WhereGivenCondition,
  WhereGivenItem,
  WhereGivenItemTuple,
  WhereGivenOr,
  WhereValue,
} from "../type.js";
import { InvalidQueryValueError } from "../error/index.js";
import { PCK } from "../internal.js";

class QueryParser implements QueryParserLike {
  // region private

  private _isField<F extends string, A extends string | symbol, S extends string>(
    value: unknown,
  ): boolean {
    return isText((value as FieldRegular<F, A, S>)?.field);
  }

  private _getFieldOrShortcut<F extends string, A extends string | symbol, S extends string>(
    query: QueryFinal<F, A, S>,
    value: unknown,
    path: string,
  ): [QueryField<F, A, S>, FieldRawValue, S] {
    if (isText(value)) {
      const str = value as QueryField<F, A, S>;
      if (query.hasAny) {
        if (query.availableFields.includes(str)) {
          return [str, undefined, undefined];
        }
        if (query.shortcut[str as S] !== undefined) {
          return [undefined, query.shortcut[str as S], str as S];
        }
        if (query.availableFields.length > 0) {
          throw new InvalidQueryValueError(`Field is not allowed`, {
            case: testCase(PCK, "xxx"),
            path,
            expected: [...query.availableFields, ...Object.keys(query.shortcut)],
            type: typeof value,
            value,
          });
        }
      }
      return [str, undefined, undefined];
    }
    throw new InvalidQueryValueError(`Field should be valid text`, {
      case: testCase(PCK, "invalid-field"),
      path,
      expected: "string",
      type: typeof value,
      value,
    });
  }

  private _getFieldOrRaw<F extends string, A extends string | symbol, S extends string>(
    query: QueryFinal<F, A, S>,
    item: unknown,
    path: string,
  ): [QueryField<F, A, S>, FieldRawValue, S] {
    let field: QueryField<F, A, S>;
    let raw2: FieldRawValue;
    let shortcut: S;

    if (this._isField(item)) {
      [field, raw2, shortcut] = this._getFieldOrShortcut(
        query,
        (item as FieldRegular<F, A, S>).field,
        `${path}.field`,
      );
    }
    let raw: FieldRawValue = raw2;
    if (this._isRaw(item)) {
      raw = (item as FieldRaw).raw;
      if (raw2 && raw2 !== raw) {
        throw new InvalidQueryValueError(`shortcut raw or raw are different`, {
          case: testCase(PCK, "xxx"),
          path,
        });
      }
      const index = Object.values(query.shortcut).indexOf(raw);
      if (index >= 0) {
        shortcut = Object.keys(query.shortcut)[index] as S;
        if (shortcut) {
          // todo warning
        }
      }
    }

    this._fieldXorRaw(field, raw, `${path}.field`);

    return [field, raw, shortcut];
  }

  private _isRaw(value: unknown): boolean {
    return isText((value as FieldRaw)?.raw);
  }

  private _getAsInObject(value: unknown, path: string): FieldAsValue {
    return this._getAsDirect((value as FieldAs)?.as, path);
  }

  private _getAsDirect(value: unknown, path: string): FieldAsValue {
    if (isEmpty(value)) {
      return undefined;
    } else if (isText(value)) {
      return value as FieldAsValue;
    }
    throw new InvalidQueryValueError(`As command should be valid text`, {
      case: testCase(PCK, "invalid-as"),
      path,
      expected: "string",
      type: typeof value,
      value,
    });
  }

  private _getAscInObject(value: unknown, path: string): boolean {
    return this._getAscDirect((value as OrderByGivenAsc)?.asc, path);
  }

  private _getAscDirect(value: unknown, path: string): boolean {
    if (isEmpty(value)) {
      return true;
    }
    if (typeof value === "boolean") {
      return value;
    } else if (isText(value)) {
      if ((value as string).toLowerCase() === "asc") {
        return true;
      } else if ((value as string).toLowerCase() === "desc") {
        return false;
      }
    }
    throw new InvalidQueryValueError(`Order type should be valid`, {
      case: testCase(PCK, "invalid-order-type"),
      path,
      expected: ["true", "false", "asc", "desc"],
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
      case: testCase(PCK, "invalid-operation"),
      path,
      expected: "@see operations",
      type: typeof value,
      value,
    });
  }

  private _value(value: unknown, path: string): Array<WhereValue> {
    if (value === undefined) {
      return [];
    }
    switch (typeof value) {
      case "string":
        if (!isText(value)) {
          throw new InvalidQueryValueError(`Value should not be empty or spaced string`, {
            case: testCase(PCK, "invalid-value"),
            path,
            expected: "string",
            type: typeof value,
            value,
          });
        }
        return [value] as WhereValue[];
      case "number":
      case "boolean":
        return [value] as WhereValue[];
      case "object":
        if (value === null) {
          return [null] as WhereValue[];
        }
        if (Array.isArray(value)) {
          let index = 0;
          for (const item of value) {
            if (!isText(item) && typeof value !== "number" && typeof value !== "boolean") {
              throw new InvalidQueryValueError(`Value should be string, number or boolean`, {
                case: testCase(PCK, "invalid-value-type"),
                path,
                expected: ["string", "number", "boolean"],
                type: typeof item,
                item,
                index,
              });
            }
            index++;
          }
          return value as WhereValue[];
        }
        break;
    }
    throw new InvalidQueryValueError(`Value should be valid`, {
      case: testCase(PCK, "invalid-value"),
      path,
      expected: ["string", "number", "boolean", "array", "number"],
      type: typeof value,
      value,
    });
  }

  private _num(value: unknown, path: string, min: number, max: number, def?: number): number {
    if (isEmpty(value)) {
      if (Number.isSafeInteger(def)) {
        return def;
      }
    } else if (Number.isSafeInteger(value)) {
      const int = value as number;
      if (int < min) {
        throw new InvalidQueryValueError(`It should be ${min} as minimum`, {
          case: testCase(PCK, "min-number"),
          path,
          min,
          value,
        });
      }
      if (int > max) {
        throw new InvalidQueryValueError(`It should be ${max} as maximum`, {
          case: testCase(PCK, "xxx"),
          path,
          max,
          value,
        });
      }
      return int;
    }
    throw new InvalidQueryValueError(`Value should be numeric`, {
      case: testCase(PCK, "invalid-number"),
      path,
      expected: "number",
      type: typeof value,
      value,
    });
  }

  private _fieldXorRaw(field: unknown, raw: unknown, path: string): void {
    if (!raw && !field) {
      throw new InvalidQueryValueError(`Field or raw are not provided, one of them should be`, {
        case: testCase(PCK, "no-raw-no-field"),
        path,
      });
    } else if (raw && field) {
      throw new InvalidQueryValueError(
        `Field and raw are provided together, Field or raw are not provided, only one of them should be`,
        {
          case: testCase(PCK, "both-raw-field"),
          path,
          raw,
          field: field as string,
        },
      );
    }
  }

  // endregion private

  // region parts
  protected _select<F extends string, A extends string | symbol, S extends string>(
    query: QueryFinal<F, A, S>,
    given: SelectGiven<F, A, S>,
    path: string,
  ): SelectFinal<F, A, S> {
    if (isEmpty(given)) {
      return { all: true };
    }
    // Cases:
    // 1 - SelectGivenAll
    // 2 - Array<SelectGivenItem<F,  A>>
    // 2A - QF<F,  A>
    // 2B - SelectGivenItemTuple<F, A, S>
    // 2C - SelectGivenItemField<F, A, S>
    // 2D - SelectGivenItemRaw;
    // 3 - SelectGivenMap<F, A, S>

    // 1 - SelectGivenAll
    if (given === "*") {
      return { all: true };
    }

    const newSelect: SelectFinal<F, A, S> = { fields: [] };

    // 2 - Array<SelectGivenItem<F,  A>>
    if (Array.isArray(given)) {
      if (given.length < 1) {
        return { all: true };
      }
      const arr = given as Array<SelectGivenItem<F, A, S>>;
      arr.forEach((item, index) => {
        // 2A - QF<F,  A>
        if (isText(item)) {
          const [field, raw] = this._getFieldOrShortcut(query, item, `${path}[${index}]`);
          if (raw) {
            throw new InvalidQueryValueError(`As should be used for raw`, {
              case: testCase(PCK, "xxx"),
              path: `${path}[${index}]`,
              expected: ["string"],
              index,
            });
          }
          newSelect.fields.push({ field, raw });
        }
        // 2B - SelectGivenItemTuple<F, A, S>
        else if (Array.isArray(item)) {
          const tuple = item as SelectGivenItemTuple<F, A, S>;
          const [field, raw] = this._getFieldOrShortcut(query, tuple[0], `${path}[${index}][0]`);
          const as = this._getAsDirect(tuple[1], `${path}[${index}][1]`);
          if (raw && !as) {
            throw new InvalidQueryValueError(`As should be used for raw`, {
              case: testCase(PCK, "xxx"),
              path: `${path}[${index}][1]`,
              expected: ["string"],
              index,
            });
          }
          newSelect.fields.push({ field, raw, as });
        }
        // 2C - SelectGivenItemField<F, A, S>
        // 2D - SelectGivenItemRaw;
        else if (isFilledObj(item)) {
          const [field, raw] = this._getFieldOrRaw<F, A, S>(query, item, `${path}[${index}]`);
          const as = this._getAsInObject(item, `${path}[${index}].as`);
          if (raw && !as) {
            throw new InvalidQueryValueError(`As should be used for raw`, {
              case: testCase(PCK, "xxx"),
              path: `${path}[${index}].as`,
              expected: ["string"],
              index,
            });
          }
          newSelect.fields.push({ field, raw, as });
        }
        // other
        else {
          throw new InvalidQueryValueError(`Invalid select item`, {
            case: testCase(PCK, "invalid-select-item"),
            path: `${path}[${index}]`,
            expected: ["string", "array", "object"],
            type: typeof item,
            value: item,
            index,
          });
        }
      });
    } else if (isObj(given)) {
      if (!isFilledObj(given)) {
        return { all: true };
      }
      let index = 0;
      for (const [k, v] of Object.entries(given)) {
        const [field, raw] = this._getFieldOrShortcut(query, k, `${path}(#${index})`);
        const as = this._getAsDirect(v, `${path}.${k}`);
        if (raw && !as) {
          throw new InvalidQueryValueError(`As should be used for raw`, {
            case: testCase(PCK, "xxx"),
            path: `${path}.${k}`,
            expected: ["string"],
            index,
          });
        }
        newSelect.fields.push({ field, raw, as });
        index++;
      }
    }
    // case: other
    else {
      throw new InvalidQueryValueError(`Invalid select block`, {
        case: testCase(PCK, "invalid-select-block"),
        path,
        expected: ["*", "array"],
        type: typeof given,
        value: given,
      });
    }
    return newSelect;
  }

  private _invalidValueLength(expected: number, values: Array<WhereValue>, path: string): void {
    if (values.length !== 1) {
      throw new InvalidQueryValueError(`Value length is not expected`, {
        case: testCase(PCK, "xxx"),
        path: `${path}]`,
        expectedLength: expected,
        actualLength: values.length,
        value: values,
      });
    }
  }
  private _invalidValueType(
    expected: Array<BasicType>,
    values: Array<WhereValue>,
    path: string,
  ): void {
    values.forEach((value, index) => {
      const type = typeof value;
      if (!expected.includes(type)) {
        throw new InvalidQueryValueError(`Value type is not expected`, {
          case: testCase(PCK, "xxx"),
          path: `${path}]`,
          expected: new Set(expected),
          type,
          value,
          index,
        });
      }
    });
  }

  private _checkWhereValue<F extends string, A extends string | symbol, S extends string>(
    holder: WhereFinal<F, A, S>,
    item: WhereFinalItem<F, A, S>,
    path: string,
  ): void {
    const cond = item as WhereFinalCondition;
    if (cond.fullRaw) {
      holder.push(item);
      return;
    }
    switch (cond.op) {
      case "eq": // string, number, boolean
      case "ne": // string, number, boolean
        cond.value = cond.value.filter((v) => !isEmpty(v));
        this._invalidValueLength(1, cond.value, path);
        this._invalidValueType(["string", "number", "boolean"], cond.value, path);
        holder.push(item);
        return;
      case "gt": // string, number
      case "gte": // string, number
      case "lt": // string, number
      case "lte": // string, number
        cond.value = cond.value.filter((v) => !isEmpty(v));
        this._invalidValueLength(1, cond.value, path);
        this._invalidValueType(["string", "number"], cond.value, path);
        holder.push(item);
        return;
      case "exists": // json object
      case "!exists": // json object
        cond.value = cond.value.filter((v) => !isEmpty(v));
        this._invalidValueLength(1, cond.value, path);
        this._invalidValueType(["string"], cond.value, path);
        holder.push(item);
        return;
      case "null": // any
      case "!null": // any
      case "missing": // any
      case "!missing": // any
        cond.value = cond.value.filter((v) => !isEmpty(v));
        this._invalidValueLength(0, cond.value, path);
        holder.push(item);
        return;
      case "true": // boolean
      case "false": // boolean
        cond.value = cond.value.filter((v) => !isEmpty(v));
        this._invalidValueLength(0, cond.value, path);
        holder.push(item);
        return;
      case "between": // string, number
      case "!between": // string, number
        this._invalidValueLength(2, cond.value, path);
        if (!isEmpty(cond.value[0])) {
          if (!isEmpty(cond.value[1])) {
            this._invalidValueType(["string", "number"], cond.value, path);
            holder.push(item as WhereFinalItem<F, A, S>);
            return;
          } else {
            cond.op = "gte";
            cond.value = [cond.value[0]];
            this._invalidValueType(["string", "number"], cond.value, path);
            holder.push(item as WhereFinalItem<F, A, S>);
            return;
          }
        } else if (!isEmpty(cond.value[1])) {
          cond.op = "lte";
          cond.value = [cond.value[1]];
          this._invalidValueType(["string", "number"], cond.value, path);
          holder.push(item as WhereFinalItem<F, A, S>);
          return;
        }
        // both of them is empty
        this._invalidValueLength(2, cond.value, path);
        holder.push(item);
        return;
      case "in": // string, number, boolean
      case "!in": // string, number, boolean
      case "includes": // string, number, boolean
      case "!includes": // string, number, boolean
      case "intersects": // string, number, boolean
      case "!intersects": // string, number, boolean
        if (cond.value.length < 1) {
          this._invalidValueLength(1, cond.value, path);
        }
        this._invalidValueType(["string", "number", "boolean"], cond.value, path);
        holder.push(item);
        return;
      case "starts": // string
      case "!starts": // string
      case "ends": // string
      case "!ends": // string
      case "contains": // string
      case "!contains": // string
        this._invalidValueLength(1, cond.value, path);
        this._invalidValueType(["string"], cond.value, path);
        holder.push(item);
        return;
      case "matches": // string
      case "!matches": // string
        this._invalidValueLength(1, cond.value, path);
        if (!(cond.value[0] instanceof RegExp)) {
          this._invalidValueType(["string"], cond.value, path);
          cond.value[0] = new RegExp(cond.value[0] as string, "g");
        }
        holder.push(item);
        return;
      default:
        holder.push(item);
        return;
    }
  }
  protected _where<F extends string, A extends string | symbol, S extends string>(
    query: QueryFinal<F, A, S>,
    given: WhereGiven<F, A, S>,
    path: string,
    inAnd: boolean,
  ): WhereFinal<F, A, S> {
    if (isEmpty(given)) {
      return [];
    }
    // Cases:
    // 1 - WhereGivenMap<F, A, S>
    // 2 - Array<WhereGivenItem<F, A, S>>;
    // 2A - WhereGivenOr<F, A, S>
    // 2B - WhereGivenItemField<F, A, S>
    // 2C - WhereGivenItemRaw
    // 2D - WhereGivenItemTuple<F, A, S>

    const newWhere: WhereFinal<F, A, S> = [];

    // 1 - WhereGivenMap<F, A, S>
    if (isObj(given)) {
      if (!isFilledObj(given)) {
        return [];
      }
      let index = 0;
      for (const [k, v] of Object.entries(given)) {
        const [field, raw] = this._getFieldOrShortcut(query, k, `${path}(#${index})`);
        const value = this._value(v, `${path}.${field}`);
        this._checkWhereValue(newWhere, { field, raw, value, op: "eq" }, path);
        index++;
      }
      return newWhere;
    }

    // 2 - Array<WhereGivenItem<F, A, S>>
    else if (Array.isArray(given)) {
      if (given.length < 1) {
        return [];
      }
      const arr = given as Array<WhereGivenItem<F, A, S>>;
      arr.forEach((item, index) => {
        // 2A - WhereGivenOr<F, A, S>
        // 2B - WhereGivenItemField<F, A, S>
        // 2C - WhereGivenItemRaw
        if (isFilledObj(item)) {
          // 2A - WhereGivenOr<F, A, S>
          if ((item as WhereGivenOr<F, A, S>).$or !== undefined) {
            if (!inAnd) {
              throw new InvalidQueryValueError(`Nested recurring $or usage`, {
                case: testCase(PCK, "xxx"),
                path: `${path}[${index}]`,
              });
            }
            this._checkWhereValue(
              newWhere,
              {
                $or: this._where<F, A, S>(
                  query,
                  (item as WhereGivenOr<F, A, S>).$or,
                  `${path}[${index}].$or`,
                  false,
                ),
              },
              path,
            );
          } else if ((item as WhereGivenAnd<F, A, S>).$and !== undefined) {
            if (inAnd) {
              throw new InvalidQueryValueError(`Nested recurring $and usage`, {
                case: testCase(PCK, "xxx"),
                path: `${path}[${index}]`,
              });
            }
            this._checkWhereValue(
              newWhere,
              {
                $and: this._where<F, A, S>(
                  query,
                  (item as WhereGivenAnd<F, A, S>).$and,
                  `${path}[${index}].$and`,
                  true,
                ),
              },
              path,
            );
          }

          // 2B - WhereGivenItemField<F, A, S>
          // 2C - WhereGivenItemRaw
          else {
            const [field, raw] = this._getFieldOrRaw<F, A, S>(query, item, `${path}[${index}]`);
            let fullRaw: true;
            let op: OperationType;
            let value: Array<WhereValue>;
            const whereItem = item as WhereGivenCondition;
            if (raw && isEmpty(whereItem.op) && isEmpty(whereItem.value)) {
              fullRaw = true;
            } else {
              op = this._operation(whereItem.op, `${path}[${index}].op`);
              value = this._value(whereItem.value, `${path}[${index}].value`);
            }
            this._checkWhereValue(newWhere, { field, op, value, raw, fullRaw }, path);
          }
        }

        // 2D - WhereGivenItemTuple<F, A, S>
        else if (Array.isArray(item) && item.length > 0) {
          const tuple = item as WhereGivenItemTuple<F, A, S>;
          const [field, raw] = this._getFieldOrShortcut(query, tuple[0], `${path}[${index}][0]`);
          const value = this._value(item[1], `${path}[${index}][1]`);
          this._checkWhereValue(newWhere, { field, raw, value, op: "eq" }, path);
        } else {
          throw new InvalidQueryValueError(`Invalid condition item`, {
            case: testCase(PCK, "invalid-where-item"),
            path: `${path}[${index}]`,
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
      throw new InvalidQueryValueError(`Invalid condition block`, {
        case: testCase(PCK, "invalid-where-block"),
        path,
        expected: ["object", "array"],
        type: typeof given,
        value: given,
      });
    }
    return newWhere;
  }

  protected _groupBy<F extends string, A extends string | symbol, S extends string>(
    query: QueryFinal<F, A, S>,
    given: GroupByGiven<F, A, S>,
    path: string,
  ): GroupByFinal<F, A, S> {
    if (isEmpty(given)) {
      return [];
    }
    // Cases:
    // 1 - Array<GroupByGivenItem<F, A, S>>
    // 1A - QF<F, A, S>
    // 1B - GroupByGivenItemRegular<F, A, S>
    // 1C - GroupByGivenItemRaw
    const newGroup: GroupByFinal<F, A, S> = [];

    // 1 - Array<GroupByGivenItem<F, A, S>>
    if (Array.isArray(given)) {
      if (given.length < 1) {
        return [];
      }
      const arr = given as Array<GroupByGivenItem<F, A, S>>;
      arr.forEach((item, index) => {
        // 1A - QF<F, A, S>
        if (isText(item)) {
          const [field, raw] = this._getFieldOrShortcut(query, item, `${path}[${index}]`);
          newGroup.push({ field, raw });
        }
        // 1B - GroupByGivenItemRegular<F, A, S>
        // 1C - GroupByGivenItemRaw
        else if (isFilledObj(item)) {
          const [field, raw] = this._getFieldOrRaw<F, A, S>(query, item, `${path}[${index}]`);
          if (field) {
            newGroup.push({ field });
          } else {
            newGroup.push({ raw });
          }
        } else {
          throw new InvalidQueryValueError(`Invalid group by item`, {
            case: testCase(PCK, "invalid-group-item"),
            path: `${path}[${index}]`,
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
        case: testCase(PCK, "invalid-group-block"),
        path,
        expected: ["array"],
        type: typeof given,
        value: given,
      });
    }
    return newGroup;
  }

  protected _orderBy<F extends string, A extends string | symbol, S extends string>(
    query: QueryFinal<F, A, S>,
    given: OrderByGiven<F, A, S>,
    path: string,
  ): OrderByFinal<F, A, S> {
    if (isEmpty(given)) {
      return [];
    }
    // Cases:
    // 1 - QF<F, A, S>
    // 2 - Array<OrderByGivenItem<F, A, S>>
    // 2A - QF<F, A, S>
    // 2B - OrderByGivenItemField<F, A, S>
    // 2C - OrderByGivenItemRaw
    // 3 - OrderByGivenMap<F, A, S>
    const newOrder: OrderByFinal<F, A, S> = [];

    // 1 - QF<F, A, S>
    if (isText(given)) {
      const [field, raw] = this._getFieldOrShortcut(query, given, path);
      newOrder.push({ field, raw, asc: true });
      return newOrder;
    }

    // 2 - Array<OrderByGivenItem<F, A, S>>
    else if (Array.isArray(given)) {
      if (given.length < 1) {
        return newOrder;
      }
      const arr = given as Array<OrderByGivenItem<F, A, S>>;
      arr.forEach((item, index) => {
        // 2A - QF<F, A, S>
        if (isText(item)) {
          const [field, raw] = this._getFieldOrShortcut(query, item, `${path}[${index}]`);
          newOrder.push({ field, raw, asc: true });
        }
        // 2B - OrderByGivenItemField<F, A, S>
        // 2C - OrderByGivenItemRaw
        else if (isFilledObj(item)) {
          const [field, raw] = this._getFieldOrRaw<F, A, S>(query, item, `${path}[${index}]`);
          const asc = this._getAscInObject(item, `${path}[${index}]`);

          if (field) {
            newOrder.push({ field, asc });
          } else {
            newOrder.push({ raw, asc });
          }
        }
        // other
        else {
          throw new InvalidQueryValueError(`Invalid order by item`, {
            case: testCase(PCK, "invalid-order-item"),
            path: `${path}[${index}]`,
            expected: ["string", "object"],
            type: typeof item,
            value: item,
            index,
          });
        }
      });
    }

    // 3 - OrderByGivenMap<F, A, S> as {id: true, name: true, ...}
    else if (isObj(given)) {
      if (!isFilledObj(given)) {
        return newOrder;
      }
      let index = 0;
      for (const [k, v] of Object.entries(given)) {
        const [field, raw] = this._getFieldOrShortcut(query, k, `${path}(#${index})`);
        const asc = this._getAscDirect(v, `${path}.${field}`);
        newOrder.push({ field, raw, asc });
        index++;
      }
    }

    // case: other
    else {
      throw new InvalidQueryValueError(`Invalid order by block`, {
        case: testCase(PCK, "invalid-order-block"),
        path,
        expected: ["string", "array", "object"],
        type: typeof given,
        value: given,
      });
    }
    return newOrder;
  }

  protected _availableFields<F extends string, A extends string | symbol, S extends string>(
    given: Array<QueryField<F, A, S>>,
    aliases: Array<A>,
    path: string,
  ): Array<QueryField<F, A, S>> {
    const result = [] as Array<QueryField<F, A, S>>;
    if (isEmpty(given)) {
      return result;
    }
    if (isFilledArr(aliases)) {
      aliases.forEach((alias, index) => {
        if (!isText(alias)) {
          throw new InvalidQueryValueError(`Invalid alias item`, {
            case: testCase(PCK, "xxx"),
            path: `${path}[${index}]`,
            expected: ["string"],
            type: typeof alias,
            value: alias,
          });
        }
      });
    } else {
      aliases = [];
    }

    if (Array.isArray(given)) {
      if (given.length < 1) {
        return result;
      }
      given.forEach((item, index) => {
        if (!isText(item)) {
          throw new InvalidQueryValueError(`Invalid field item`, {
            case: testCase(PCK, "xxx"),
            path: `${path}[${index}]`,
            expected: ["string"],
            type: typeof item,
            value: item,
          });
        }
        result.push(item);
      });
      const allFields = [...result];
      aliases.forEach((alias) => {
        result.forEach((item) => {
          const newField = `${alias as string}.${item}` as QueryField<F, A, S>;
          if (!allFields.includes(newField)) {
            allFields.push(newField);
          }
        });
      });
      return allFields;
    }
    throw new InvalidQueryValueError(`Invalid fields block`, {
      case: testCase(PCK, "xxx"),
      path,
      expected: ["array"],
      type: typeof given,
      value: given,
    });
  }

  protected _shortcut<S extends string>(given: QueryShortcut<S>, path: string): QueryShortcut<S> {
    const result = {} as QueryShortcut<S>;
    if (isEmpty(given)) {
      return result;
    }
    if (isObj(given)) {
      if (!isFilledObj(given)) {
        return result;
      }
      for (const [k, v] of Object.entries(given)) {
        if (!isText(v)) {
          throw new InvalidQueryValueError(`Invalid shortcut item`, {
            case: testCase(PCK, "xxx"),
            path: `${path}.${k}`,
            expected: ["string"],
            type: typeof v,
            value: v,
          });
        }
        result[k] = v;
      }
      return result;
    }
    throw new InvalidQueryValueError(`Invalid shortcut block`, {
      case: testCase(PCK, "xxx"),
      path,
      expected: ["object"],
      type: typeof given,
      value: given,
    });
  }

  protected _pagination<F extends string, A extends string | symbol, S extends string>(
    query: QueryFinal<F, A, S>,
    given: PaginationGiven,
    path: string,
  ): PaginationFinal {
    const result: PaginationFinal = !query.isSub
      ? {
          limit: 1_000,
          offset: 0,
        }
      : { limit: undefined, offset: undefined };

    if (isEmpty(given)) {
      return result;
    }

    // Cases
    // 1 - PaginationGivenTuple
    // 2 - PaginationGivenLimit
    // 3 - PaginationGivenPage

    // 1 - PaginationGivenTuple;
    if (Array.isArray(given)) {
      if (given.length < 1) {
        return result;
      }
      result.limit = this._num(given[0], `${path}[0]`, 1, 10_000, 1_000);
      result.offset = this._num(given[1], `${path}[1]`, 0, 1_000_000, 0);
      return result;
    }

    // 2 - PaginationGivenLimit
    // 3 - PaginationGivenPage
    else if (isObj(given)) {
      if (!isFilledObj(given)) {
        return result;
      }
      const obj = given as PaginationGivenLimit & PaginationGivenPage;
      if (!isEmpty(obj.page)) {
        const page = this._num(obj.page, `${path}.page`, 1, 100_00, 1);
        const size = this._num(obj.size, `${path}.size`, 1, 10_000, 1_000);
        ["limit", "offset"].forEach((f) => {
          if (!isEmpty(given[f])) {
            throw new InvalidQueryValueError(
              `If you give page; limit and offset can not be used anymore`,
              {
                case: testCase(PCK, "both-limit-offset"),
                path: "pagination",
                value: given,
              },
            );
          }
        });
        result.limit = size;
        result.offset = (page - 1) * size;
        return result;
      }
      if (!isEmpty(obj.limit)) {
        ["page", "size"].forEach((f) => {
          if (!isEmpty(obj[f])) {
            throw new InvalidQueryValueError(
              `If you give limit; page and size can not be used anymore`,
              {
                case: testCase(PCK, "both-page-size"),
                path: "pagination",
                value: given,
              },
            );
          }
        });
        result.limit = this._num(obj.limit, `pagination.limit`, 1, 10_000, 1_000);
        result.offset = this._num(obj.offset, `pagination.offset`, 0, 1_000_000, 0);
        return result;
      }
      throw new InvalidQueryValueError(`Pagination should have limit/offset or page/size keys`, {
        case: testCase(PCK, "no-limit-offset"),
        path,
        value: given,
      });
    }
    throw new InvalidQueryValueError(`Invalid pagination block`, {
      case: testCase(PCK, "invalid-pagination-block"),
      path,
      expected: ["array", "object"],
      type: typeof given,
      value: given,
    });
  }

  // endregion parts

  private _execShared<F extends string, A extends string | symbol, S extends string>(
    given: QueryGivenExtended<F, A, S>,
    parent: Partial<QueryFinal<F, A, S>>,
    name: string,
  ): QueryFinal<F, A, S> {
    const query = {} as QueryFinal<F, A, S>;
    if (parent === undefined) {
      query.availableFields = given.availableFields;
      query.shortcut = this._shortcut(given?.shortcut, `${name}.shortcut`);
      if (query.availableFields.length > 0 || Object.entries(query.availableFields).length > 0) {
        (query as Mutable<QueryFinal<F, A, S>>).hasAny = true;
      }
    } else {
      (query as Mutable<QueryFinal<F, A, S>>).isSub = true;
      (query as Mutable<QueryFinal<F, A, S>>).hasAny = parent.hasAny;
      query.availableFields = parent.availableFields;
      query.shortcut = parent.shortcut;
    }
    query.select = this._select(query, given?.select, `${name}.select`);
    query.groupBy = this._groupBy(query, given?.groupBy, `${name}.groupBy`);
    query.where = this._where(query, given?.where, `${name}.where`, true);
    query.having = this._where(query, given?.having, `${name}.having`, true);
    query.orderBy = this._orderBy(query, given?.orderBy, `${name}.orderBy`);
    query.pagination = this._pagination(query, given?.pagination, `${name}.pagination`);
    return query;
  }

  exec<F extends string = string, A extends string | symbol = symbol, S extends string = string>(
    given: QueryGiven<F, A, S>,
    availableFields: Array<QueryField<F, A, S>>,
    aliases?: Array<A>,
    name?: string,
  ): QueryFinal<F, A, S> {
    name = isText(name) ? name : "query";
    availableFields = this._availableFields(availableFields, aliases, `${name}.availableFields`);
    const extended: QueryGivenExtended<F, A, S> = isObj(given)
      ? { ...given, availableFields }
      : { availableFields };
    return this._execShared(extended, undefined, name);
  }
}

setFqn(QueryParser, PCK);

// noinspection JSUnusedGlobalSymbols
export const queryParser: QueryParserLike = new QueryParser();
