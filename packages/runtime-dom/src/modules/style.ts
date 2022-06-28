export const patchStyle = (
  el: HTMLElement,
  prevValue: object,
  nextValue: object
) => {
  // 设置新样式
  for (const key in nextValue) {
    el.style[key] = nextValue[key];
  }
  // 删除老的一些样式 不在新的里面存在的
  if (prevValue) {
    // 如果新的节点没有属性 则卸载所有样式
    if (!nextValue) return el.removeAttribute("style");
    for (const key in prevValue) {
      // 卸载不需要的样式
      if (nextValue[key] == null) el.style[key] = null;
    }
  }
};
