import {
  errorPool,
  KEY_ERROR_DEFAULT_MESSAGE,
  KEY_ERROR_EMIT,
  KEY_ERROR_I18N,
  KEY_FQN_PACKAGE,
  LeyyoError,
} from "@leyyo/common";
import { PCK } from "../internal.js";

export class InvalidQueryValueError extends LeyyoError {
  static {
    this[KEY_FQN_PACKAGE] = PCK;
    this[KEY_ERROR_DEFAULT_MESSAGE] = "Invalid query value error";
    this[KEY_ERROR_EMIT] = true;
    this[KEY_ERROR_I18N] = true;
    errorPool.define(this);
  }
}
