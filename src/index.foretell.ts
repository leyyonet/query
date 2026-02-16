import {FQN} from "./internal.js";
import {errorPool, foretell_leyyoCommon, literalPool} from "@leyyo/common";


// noinspection JSUnusedGlobalSymbols
export const foretell_leyyoQuery = [
    // dependencies
    ...foretell_leyyoCommon,

    // errors
    () => errorPool.lazy(FQN, 'InvalidQueryValueError', import('./error/invalid-query-value.error.js').then(m => m.InvalidQueryValueError), {i18n: true, emit: true}),

    // enums
    () => literalPool.register({
        name: 'OperationType',
        fqn: FQN,
        i18n: true,
        lazyTarget: import('./operation/operation-type.js').then(m => m.OperationTypeItems),
        lazyAlt: import('./operation/operation-type.js').then(m => m.OperationTypeMap),
    }),
];
