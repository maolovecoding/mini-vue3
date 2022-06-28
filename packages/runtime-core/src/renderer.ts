/**
 * 创建渲染器
 * @param renderOptions
 * @returns
 */
export const createRenderer = (renderOptions: RenderOptions<any>) => {
  // 渲染函数
  const render = (vnode, container) => {};
  return {
    render,
  };
};

interface RenderOptions<T = any> {
  insert: (child: T, parent: T, anchor: null | T) => void;
  remove: (child: T) => void;
  setElementText: (el, text) => void;
  setText: (el, text) => void;
  querySelector: (selector: string) => any;
  querySelectorAll: (selector: string) => any;
  parentNode;
  nextSibling;
  createElement;
  createText;
  createComment;
}
