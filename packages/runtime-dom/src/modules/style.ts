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
    for (const key in prevValue) {
      if (nextValue[key] == null) el.style[key] = null;
    }
  }
};
