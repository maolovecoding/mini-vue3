import { ShapeFlags } from "@vue/shared";
/**
 * 创建渲染器
 * @param renderOptions
 * @returns
 */
export const createRenderer = (renderOptions: RenderOptions<any>) => {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
  } = renderOptions;

  /**
   * 更新 初渲染
   * @param n1
   * @param n2
   * @param container
   * @returns
   */
  const patch = (n1, n2, container) => {
    // TODO n2可能是个文本
    if (n1 === n2) return;
    if (n1 == null) {
      // 初次渲染
      // 后续还有组件的初次渲染
      mountElement(n2, container);
    } else {
      // 更新流程
    }
  };
  /**
   * 虚拟dom -> 真实DOM -> 挂载到页面
   * @param vnode
   * @param container
   */
  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));
    // 处理属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 看当前节点的孩子是文本节点 还是数组节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本节点 直接设置到当前元素节点上
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组孩子
      mountChildren(children, el);
    }
    // 挂载
    hostInsert(el, container);
  };
  const mountChildren = (children, el) => {
    console.log(children, el);
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el);
    }
  };
  // 渲染函数
  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载节点
    } else {
      // 挂载 1. 初始化挂载 2. 更新节点
      patch(container._vnode || null, vnode, container);
    }
    // 记录旧的 vnode 方便更新操作
    container._vnode = vnode;
  };
  return {
    render,
  };
};

interface RenderOptions<T = any> {
  insert: (child: T, parent: T, anchor?: null | T) => void;
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
  patchProp;
}
