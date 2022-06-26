export const isObject = (val: unknown): val is object =>
  val != null && typeof val === "object";

type Falsy = 0 | null | undefined | "" | false;
export const isFalsy = (val: unknown): val is Falsy => !val;

export const isFunction = (val: unknown): val is Function => {
  return typeof val === "function";
};
export const isString = (val: unknown): val is string => {
  return typeof val === "string";
};

export const isNumber = (val: unknown): val is number => {
  return typeof val === "number";
};

export const isArray = Array.isArray;

export const assign = Object.assign;
