import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

/**
 * 属性操作
 * @param el
 * @param key
 * @param prevValue
 * @param nextValue
 */
export const patchProp = (
  el: Node,
  key: string,
  prevValue: string,
  nextValue: string
) => {
  if (key === "class") {
    patchClass(el as HTMLElement, nextValue);
  } else if (key === "style") {
    patchStyle(el as HTMLElement, prevValue as any, nextValue as any);
  } else if (/^on[^a-z]/.test(key)) {
    patchEvent(el as HTMLElement, key, nextValue as any as Function);
  } else {
    patchAttr(el  as HTMLElement, key, nextValue);
  }
};
