import { PCK } from "../internal.js";
import { definePredictor, errorPool, literalPool } from "@leyyo/common";

// noinspection JSUnusedGlobalSymbols
export const leyyoQueryPredictor = definePredictor(PCK)
  .dependency(() => import("@leyyo/common").then((m) => m.leyyoCommonPredictor))
  //errors
  .add(() =>
    errorPool.lazy(
      PCK,
      "InvalidQueryValueError",
      import("../error/invalid-query-value.error.js").then((m) => m.InvalidQueryValueError),
    ),
  )
  //literals
  .add(
    () =>
      literalPool.register({
        name: "OperationType",
        pck: PCK,
        i18n: true,
        lazyTarget: import("../literal/operation-type.js").then((m) => m.OperationTypeItems),
        lazyAlt: import("../literal/operation-type.js").then((m) => m.OperationTypeMap),
      }),
    () =>
      literalPool.register({
        name: "OrderType",
        pck: PCK,
        i18n: true,
        lazyTarget: import("../literal/order-type.js").then((m) => m.OrderTypeItems),
      }),
  )
  .end();
