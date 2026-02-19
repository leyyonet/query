import { defineLoader, loader_leyyoCommon } from "@leyyo/common";
import { FQN } from "./internal.js";

// noinspection JSUnusedGlobalSymbols
export const loader_leyyoQuery = defineLoader(
  FQN,
  // dependencies
  ...loader_leyyoCommon,

  // errors
  () => import("./error/invalid-query-value.error.js").then((m) => m.InvalidQueryValueError),
  // enums
  () => import("./operation/operation-type.js").then((m) => m.OperationTypeItems),
  // classes
  () => import("./parser/query.parser.js").then((m) => m.queryParser),
);
