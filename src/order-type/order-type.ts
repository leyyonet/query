const literals = ["asc", "desc"] as const;
/**
 * Order Type
 * */
export type OrderType = (typeof literals)[number];
export const OrderTypeItems = literals as ReadonlyArray<OrderType>;
