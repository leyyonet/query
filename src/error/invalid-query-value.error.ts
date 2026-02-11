import {QueryErrorCode} from "./index.types";
import {LeyyoError} from "@leyyo/common";

export class InvalidQueryValueError extends LeyyoError {
    constructor(code: QueryErrorCode, readonly message: string, readonly path: string) {
        super(`[${code}] ${message} at ${path}`);
    }
}
