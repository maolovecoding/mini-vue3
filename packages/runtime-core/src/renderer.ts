import { isString } from "./../../shared/src/index";
import { createVnode, isSameVnode, Text } from "./vnode";
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
   * 处理文本节点
   * @param n1
   * @param n2
   * @param container
   */
  const processText = (n1, n2, container) => {
    if (n1 == null) {
      n2.el = hostCreateText(n2.children);
      hostInsert(n2.el, container);
    } else {
      // TODO 文本内容更新 可以复用老节点
      n2.el = n1.el;
      if (n1.children !== n2.children) hostSetText(n1.el, n2.children);
    }
  };
  /**
   * 处理元素节点 组件节点等
   * @param n1
   * @param n2
   * @param container
   */
  const processElement = (n1, n2, container, anchor = undefined) => {
    if (n1 == null) {
      // 挂载
      mountElement(n2, container, anchor);
    } else {
      // 更新
      patchElement(n1, n2, container);
    }
  };
  /**
   * 更新元素节点
   * 先复用节点 然后比较属性 最后更新子节点
   * @param n1
   * @param n2
   * @param el
   */
  const patchElement = (n1, n2, container) => {
    const el = (n2.el = n1.el);
    // 比较属性
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    // 比较孩子
    patchChildren(n1, n2, el);
  };
  const patchProps = (oldProps, newProps, el) => {
    // 新属性直接覆盖旧属性
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    // 不需要的属性 删除
    for (const key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };
  const patchChildren = (n1, n2, el) => {
    // 比较两个虚拟节点的子节点的差异
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;
    // 比较两个子列表的差异 文本 null 数组
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 1. 新 文本 老 数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 卸载所有子节点
        unmountChildren(c1);
      }
      // 2. 新旧 都是文本   旧子节点是空
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 3. 都是数组 diff
        if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO  diff
          // 全量更新
          patchKeyedChildren(c1, c2, el);
        } else {
          // 5. 新节点是空 删除所有儿子
          // 6. 或者删除文本
          unmountChildren(c1);
        }
      } else {
        // 4. 数组 文本 清空文本 创建新的子节点
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };
  /**
   * diff 更新vnode -> dom
   * @param c1
   * @param c2
   * @param el
   */
  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0; // 两个子节点的头指针
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // 从前往后比 相同的节点直接复用，不同的时候退出循环了
    // 任意一方头尾指针相同，结束循环
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        // 同一个dom节点 复用 递归比较属性和子节点了
        patch(n1, n2, el);
      } else {
        // 不同 则退出循环 后面的节点默认都是不同的 前面的都是相同节点
        break;
      }
      i++;
    }
    // 从后开始往前比
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else break;
      e1--;
      e2--;
    }
    // 同序列 common sequence + mount
    // i 比 e1 大 则 i 和 e2 之间的节点都是新增节点(可能没有)
    if (i > e1) {
      while (i <= e2) {
        // 循环创建新增节点
        const nextPos = e2 + 1;
        // 插入指定兄弟节点之前
        const anchor = c2[nextPos]?.el;
        patch(null, c2[i++], el, anchor);
      }
    }
    // 同序列卸载 
    else if(i > e2){
      debugger
      while(i <= e1){
        unmount(c1[i++])
      }
    }
    // TODO 乱序比对 能优化的都已经做了
    
  };
  /**
   * 卸载所有DOM节点
   * @param children
   */
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  /**
   * 更新 初渲染
   * @param n1
   * @param n2
   * @param container
   * @returns
   */
  const patch = (n1, n2, container, anchor: any | undefined = undefined) => {
    // TODO n2可能是个文本
    if (n1 === n2) return;
    if (n1 && !isSameVnode(n1, n2)) {
      // 不是同一类型的节点 直接卸载 然后重新创建
      unmount(n1);
      n1 = null;
    }
    const { type, shapeFlag } = n2;
    switch (type) {
      // 文本类型
      case Text:
        processText(n1, n2, container);
        break;
      default:
        // 元素类型
        if (shapeFlag & ShapeFlags.ELEMENT)
          // 初次渲染 后续还有组件的初次渲染 以及更新逻辑
          processElement(n1, n2, container, anchor);
    }
  };
  /**
   * 虚拟dom -> 真实DOM -> 挂载到页面
   * @param vnode
   * @param container
   */
  const mountElement = (vnode, container, anchor = undefined) => {
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
    hostInsert(el, container, anchor);
  };
  /**
   * 挂载孩子节点
   * @param children
   * @param el
   */
  const mountChildren = (children, el) => {
    console.log(children, el);
    for (let i = 0; i < children.length; i++) {
      // TODO 如果孩子是一个普通文本 "hello" 包装 返回 让字符串变成字符串的虚拟DOM
      const child = normalize(children, i);
      patch(null, child, el);
    }
  };
  /**
   * 对文本类型的节点进行封装
   * TODO 对于 文本节点 我们不能直接创建 createElement 所以需要包装一层 然后通过createText
   * @param child
   * @returns
   */
  const normalize = (children, index: number) => {
    if (isString(children[index]))
      return (children[index] = createVnode(Text, null, children[index]));
    return children[index];
  };
  const unmount = (vnode) => {
    // 卸载真实DOM
    hostRemove(vnode.el);
  };
  // 渲染函数
  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载节点 如果之前渲染过 就卸载DOM
      if (container._vnode) unmount(container._vnode);
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
  patchProp: (el, key, oldProps, newProps) => void;
}
