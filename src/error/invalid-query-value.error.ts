import {QueryErrorCode} from "./index.types";

export class InvalidQueryValueError extends Error {
    constructor(code: QueryErrorCode, readonly message: string, readonly path: string) {
        super(`[${code}] ${message} at ${path}`);
    }
}
