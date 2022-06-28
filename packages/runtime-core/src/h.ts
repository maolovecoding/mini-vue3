import { isObject, isArray } from "@vue/shared";
import { createVnode, isVnode } from "./vnode";

export const h = function h(type: string, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // h("div", h("h1"))
      if (isVnode(propsOrChildren)) {
        // 把孩子直接变成数组
        return createVnode(type, null, [propsOrChildren]);
      }
      // h("div","hello")
      // h("div", {class:"abc"})
      return createVnode(type, propsOrChildren);
    } else {
      // h("div", [h("div")])
      return createVnode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVnode(children)) {
      children = [children];
    }
    return createVnode(type, propsOrChildren, children);
  }
};
