import {FieldAs, FieldRaw, FieldRegular} from "../field";

export type SelectAny<K extends string> = '*' | Array<K | [K, string] | SelectGiven<K> | SelectGivenRaw>;
export type SelectGiven<K extends string> = FieldRegular<K> & FieldAs;

export type SelectGivenRaw = FieldRaw & FieldAs;

export interface Select<K extends string> {
    all?: true,
    fields?: Array<SelectItemRegular<K>|SelectItemRaw>;
}

export type SelectItemRegular<K extends string> = FieldRegular<K> & FieldAs;
export type SelectItemRaw = FieldRaw & FieldAs;
