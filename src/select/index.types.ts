import type {KeyOf} from "@leyyo/common";
import type {FieldAs, FieldRaw, FieldRegular} from "../field";

export type SelectAny<T> = '*' | Array<KeyOf<T> | [KeyOf<T>, string] | SelectGiven<T> | SelectGivenRaw>;
export type SelectGiven<T> = FieldRegular<T> & FieldAs;

export type SelectGivenRaw = FieldRaw & FieldAs;

export type Select<T> = true | Array<SelectItemRegular<T>|SelectItemRaw>;

export type SelectItemRegular<T> = FieldRegular<T> & FieldAs;
export type SelectItemRaw = FieldRaw & FieldAs;
