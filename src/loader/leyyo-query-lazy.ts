import { defineLazy, leyyoCommonLazy } from "@leyyo/common";
import { PCK } from "../internal.js";

// noinspection JSUnusedGlobalSymbols
export const leyyoQueryLazy = defineLazy(PCK)
  .dependency(() => import("@leyyo/common").then((m) => m.leyyoCommonLazy))
  .add(
    // errors
    () => import("../error/invalid-query-value.error.js").then((m) => m.InvalidQueryValueError),
    // literals
    () => import("../literal/operation-type.js").then((m) => m.OperationTypeItems),
    () => import("../literal/order-type.js").then((m) => m.OrderTypeItems),
    // classes
    () => import("../items/query.parser.js").then((m) => m.queryParser),
  )
  .end();
