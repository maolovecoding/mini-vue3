export const patchAttr = (el: HTMLElement, key: string, value: string) => {
  if (value) {
    el.setAttribute(key, value);
  } else {
    el.removeAttribute(key);
  }
};
