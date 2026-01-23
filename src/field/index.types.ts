import type {KeyOf} from "@leyyo/common";

export interface FieldRegular<T> {
    field: KeyOf<T>;
}
export interface FieldRaw {
    raw: string;
}
export interface FieldAs {
    as?: string;
}
