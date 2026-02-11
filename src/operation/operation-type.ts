const literals = [
    // all
    'eq',
    'ne',
    'null',
    '!null',
    'missing',
    '!missing',

    // string, number
    'gt',
    'gte',
    'lt',
    'lte',
    'between',
    '!between',
    'in',
    '!in',

    // string
    'starts',
    '!starts',
    'ends',
    '!ends',
    'matches',
    '!matches',

    'contains', // left includes right
    '!contains', // left does not include right

    'contained', // right includes left
    '!contained', // right does not include left

    // boolean
    'true',
    'false',

    // array object
    'includes',
    '!includes',
    'intersects',
    '!intersects',

    // json object
    'exists',
    '!exists',
] as const;
/**
 * Operation Type
 * */
export type OperationType = typeof literals[number];
export const OperationTypeItems = literals as ReadonlyArray<OperationType>

// noinspection JSUnusedGlobalSymbols
export const OperationTypeMap: Record<string, OperationType> = {
    // all
    '=': 'eq',
    '==': 'eq',
    'equals': 'eq',
    'equal': 'eq',

    '!equals': 'ne',
    '!equal': 'ne',
    '!=': 'ne',
    '<>': 'ne',
    'not-equals': 'ne',
    'not-equal': 'ne',

    'is-null': 'null',
    '!': 'null',
    'nil': 'null',

    '!!': '!null',
    'not-null': '!null',

    'is-missing': 'missing',
    'is-undefined': 'missing',
    'undefined': 'missing',

    'not-missing': '!missing',
    'not-undefined': '!missing',
    'defined': '!missing',

    // string, number
    'greater-than': 'gt',
    '>': 'gt',

    'greater-than-or-equals': 'gte',
    '>=': 'gte',
    '=>': 'gte',

    'less-than': 'lt',
    'less': 'lt',
    '<': 'lt',

    'less-than-or-equals': 'lte',
    '=<': 'lte',
    '<=': 'lte',

    '()': 'between',
    'not-between': '!between',
    ')(': '!between',

    '[]': 'in',

    '][': '!in',
    'not-in': '!in',
    // string

    'starts-with': 'starts',
    'start-with': 'starts',
    '^': 'starts',
    'start': 'starts',

    'not-starts-with': '!starts',
    'not-start-with': '!starts',
    'not-starts': '!starts',
    'not-start': '!starts',
    '!starts-with': '!starts',
    '!start-with': '!starts',
    '!^': '!starts',
    '!start': '!starts',

    'ends-with': 'ends',
    'end-with': 'ends',
    '$': 'ends',
    'end': 'ends',

    'not-end-with': '!ends',
    'not-ends': '!ends',
    'not-end': '!ends',
    '!$': '!ends',
    '!ends-with': '!ends',
    '!end-with': '!ends',
    '!end': '!ends',

    'match': 'matches',

    'not-matches': '!matches',
    'not-match': '!matches',
    '!match': '!matches',
    '!matches': '!matches',


    'like': 'contains',
    'likes': 'contains',
    'contain': 'contains',

    'not-contains': '!contains',
    'not-contain': '!contains',
    '!contain': '!contains',
    'not-likes': '!contains',
    'not-like': '!contains',
    '!likes': '!contains',
    '!like': '!contains',

    // boolean
    'yes': 'true',
    'no': 'false',
    'on': 'true',
    'off': 'false',
    'ok': 'true',
    'none': 'false',


    // array object
    'include': 'includes',
    'not-includes': '!includes',
    'not-include': '!includes',
    '!include': '!includes',
    'intersect': 'intersects',
    'not-intersects': '!intersects',
    'not-intersect': '!intersects',
    '!intersect': '!intersects',

    'exist': 'exists',
    '?': 'exists',
    '??': 'exists',

    'not-exists': '!exists',
    'not-exist': '!exists',
    '!?': '!exists',
    '!??': '!exists',
    '!exist': '!exists',
}
