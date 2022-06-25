export const isObject = (val: unknown): val is object =>
  val != null && typeof val === "object";

type Falsy = 0 | null | undefined | "" | false;
export const isFalsy = (val: unknown): val is Falsy => !val;
