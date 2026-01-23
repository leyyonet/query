export const ConditionTypeItems = [
    // all
    '==',
    '!=',
    'null',
    '!null',

    // string, number
    '>',
    '>=',
    '<',
    '<=',
    'between',
    '!between',
    'in',
    '!in',

    // string
    '^',
    '!^',
    '$',
    '!$',
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
export type ConditionType = typeof ConditionTypeItems[number];

// noinspection JSUnusedGlobalSymbols
export const ConditionTypeMap: Record<string, ConditionType> = {
    // all
    'eq': '==',
    '=': '==',
    'equals': '==',
    'equal': '==',

    'ne': '!=',
    '<>': '!=',
    'not-equals': '!=',
    'not-equal': '!=',

    'is-null': 'null',
    '!': 'null',
    'nil': 'null',

    '!!': '!null',
    'not-null': '!null',

    // string, number
    'greater-than': '>',
    'gt': '>',

    'greater-than-or-equals': '>=',
    'gte': '>=',
    '=>': '>=',

    'less-than': '<',
    'lt': '<',

    'less-than-or-equals': '<=',
    '=<': '<=',
    'lte': '<=',

    '()': 'between',
    'not-between': '!between',
    ')(': '!between',

    '[]': 'in',

    '][': '!in',
    'not-in': '!in',
    // string

    'starts-with': '^',
    'start-with': '^',
    'starts': '^',
    'start': '^',

    'not-starts-with': '!^',
    'not-start-with': '!^',
    'not-starts': '!^',
    'not-start': '!^',
    '!starts-with': '!^',
    '!start-with': '!^',
    '!starts': '!^',
    '!start': '!^',

    'ends-with': '$',
    'end-with': '$',
    'ends': '$',
    'end': '$',

    'not-end-with': '!$',
    'not-ends': '!$',
    'not-end': '!$',
    '!$': '!$',
    '!ends-with': '!$',
    '!end-with': '!$',
    '!ends': '!$',
    '!end': '!$',

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
    'on': 'true',
    'ok': 'true',
    'no': 'false',
    'off': 'false',
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
