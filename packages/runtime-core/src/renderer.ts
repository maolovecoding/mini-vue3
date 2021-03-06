import { isKeepAlive } from "./components/KeepAlive";
import { createVnode, Fragment, isSameVnode, Text } from "./vnode";
import { ShapeFlags, isString, invokeArrayFns, PatchFlags } from "@vue/shared";
import { getSequence } from "./sequence";
import { ReactiveEffect } from "@vue/reactivity";
import { queueJob } from "./scheduler";
import {
  createComponentInstance,
  hasPropsChanged,
  renderComponent,
  setupComponent,
  updateProps,
} from "./component";
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
  const processElement = (
    n1,
    n2,
    container,
    anchor = null,
    parentComponent = null
  ) => {
    if (n1 == null) {
      // 挂载
      mountElement(n2, container, anchor);
    } else {
      // 更新
      patchElement(n1, n2, parentComponent);
    }
  };
  /**
   * 更新元素节点
   * 先复用节点 然后比较属性 最后更新子节点
   * @param n1
   * @param n2
   * @param el
   */
  const patchElement = (n1, n2, parentComponent) => {
    const el = (n2.el = n1.el);
    // 比较属性
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 动态属性
    const { patchFlag } = n2;
    // class变化
    if (patchFlag & PatchFlags.CLASS) {
      if (oldProps.class !== newProps.class) {
        hostPatchProp(el, "class", oldProps, newProps);
      }
    } else {
      patchProps(oldProps, newProps, el);
    }

    // TODO 处理文本节点
    // n2 = normalize(n2)
    // 如果有 dynamicChildren 只比较动态节点
    if (n2.dynamicChildren?.length) {
      patchBlockChildren(n1, n2, parentComponent);
    }
    // 比较孩子 全量diff
    else patchChildren(n1, n2, el, parentComponent);
  };
  /**
   * 靶向更新
   * @param n1
   * @param n2
   */
  const patchBlockChildren = (n1, n2, parentComponent) => {
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
      patchElement(
        n1.dynamicChildren[i],
        n2.dynamicChildren[i],
        parentComponent
      );
    }
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
  const patchChildren = (n1, n2, el, parentComponent) => {
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
        unmountChildren(c1, parentComponent);
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
          patchKeyedChildren(c1, c2, el, parentComponent);
        } else {
          // 5. 新节点是空 删除所有儿子
          // 6. 或者删除文本
          unmountChildren(c1, parentComponent);
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
  const patchKeyedChildren = (c1, c2, el, parentComponent = null) => {
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
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i++]);
      }
    }
    // TODO 乱序比对 能优化的都已经做了
    let s1 = i,
      s2 = i;
    // 将新的vnode做成map比较
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }
    // 应该移动的节点个数
    let toBePatched = e2 - s2 + 1;
    // 标记被patch过的节点 也就是复用的节点
    const newIndexToOldIndex = new Array(toBePatched).fill(0);
    // 循环老的节点 看新的有没有 有就比较差异 没有就卸载节点
    for (let i = s1; i <= e1; i++) {
      const oldChild = c1[i];
      const existIndex = keyToNewIndexMap.get(oldChild.key);
      if (!existIndex) {
        // 卸载
        unmount(oldChild);
      } else {
        // 比较节点差异 新的索引对应老索引
        newIndexToOldIndex[existIndex - s2] = i + 1;
        patch(oldChild, c2[existIndex], el);
      }
    }
    // 移动节点位置 从后往前插入
    // TODO  最长递增子序列 优化
    // 获取最长递增子序列
    const increment = getSequence(newIndexToOldIndex);
    let j = increment.length - 1;
    for (let i = toBePatched - 1; i >= 0; i--) {
      let index = s2 + i;
      const current = c2[index]; // 找到最后一个节点
      const anchor = c2[index + 1]?.el; // 参照物 插入该节点前
      // 是新增 还是移动复用节点
      if (newIndexToOldIndex[i] === 0) {
        // 需要创建
        patch(null, current, el, anchor);
      } else {
        // 不相等 就插入节点 相同 就跳过
        if (i !== increment[j]) {
          // 比对过 直接移动节点即可复用
          hostInsert(current.el, el, anchor);
        } else {
          j--;
        }
      }
    }
  };
  /**
   * 卸载所有DOM节点
   * @param children
   */
  const unmountChildren = (children, parentComponent = null) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i], parentComponent);
    }
  };

  const processFragment = (n1, n2, container, parentComponent = null) => {
    if (n1 == null) {
      mountChildren(n2.children, container, parentComponent);
    } else {
      patchChildren(n1, n2, container, parentComponent);
    }
  };
  /**
   * 处理组件
   */
  const processComponent = (
    n1,
    n2,
    container,
    anchor = null,
    parentComponent = null
  ) => {
    if (n1 == null) {
      // TODO 组件激活
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        parentComponent.ctx.activate(n2.component, container, anchor);
      } else mountComponent(n2, container, anchor, parentComponent);
    } else {
      // 组件更新 靠的是props
      updateComponent(n1, n2);
    }
  };
  const updateComponent = (n1, n2) => {
    // 属性的更新会导致页面重新渲染 实例的props是响应式的
    // /组件的虚拟dom 复用的是 组件实例
    const instance = (n2.component = n1.component);
    // const { props: prevProps } = n1;
    // const { props: nextProps } = n2;
    // 属性更新
    // updateProps(instance, prevProps, nextProps);

    // 是否需要更新
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2; // 记录组件的虚拟节点
      instance.update();
    }
  };
  /**
   * 是否更新
   * @param n1
   * @param n2
   * @returns
   */
  const shouldUpdateComponent = (n1, n2) => {
    const { props: prevProps, children: prevChildren } = n1;
    const { props: nextProps, children: nextChildren } = n2;
    // 插槽 有孩子必须要更新
    if (prevChildren || nextChildren) return true;
    // props
    if (prevProps === nextProps) return false;
    return hasPropsChanged(prevProps, nextProps);
  };

  /**
   * 更新 初渲染
   * @param n1
   * @param n2
   * @param container
   * @returns
   */
  const patch = (
    n1,
    n2,
    container,
    anchor: any = null,
    parentComponent = null
  ) => {
    // TODO n2可能是个文本
    if (n1 === n2) return;
    if (n1 && !isSameVnode(n1, n2)) {
      // 不是同一类型的节点 直接卸载 然后重新创建
      unmount(n1, parentComponent);
      n1 = null;
    }
    const { type, shapeFlag } = n2;
    switch (type) {
      // 文本类型
      case Text:
        processText(n1, n2, container);
        break;
      case Fragment: //  空 标记
        processFragment(n1, n2, container, parentComponent);
        break;
      default:
        // 元素类型
        if (shapeFlag & ShapeFlags.ELEMENT)
          // 初次渲染 后续还有组件的初次渲染 以及更新逻辑
          processElement(n1, n2, container, anchor, parentComponent);
        else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件类型
          processComponent(n1, n2, container, anchor, parentComponent);
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          // 是teleport类型组件
          type.process(n1, n2, container, anchor, {
            mountChildren,
            patchChildren,
            move(vnode, container) {
              hostInsert(
                // 组件 还是 vnode
                vnode.component ? vnode.component.subTree.el : vnode.el,
                container
              );
            },
          });
        }
    }
  };

  /**
   * 挂载组件
   * @param vnode
   * @param container
   * @param anchor
   */
  const mountComponent = (
    vnode,
    container,
    anchor = null,
    parentComponent = null
  ) => {
    // 1. 创造组件实例
    const instance = (vnode.component = createComponentInstance(
      vnode,
      parentComponent
    ));
    // TODO kee-alive的处理方式
    if (isKeepAlive(vnode)) {
      instance.ctx.renderer = {
        createElement: hostCreateElement, // 创建元素
        move(vnode, container, anchor) {
          hostInsert(vnode.component.subTree.el, container, anchor);
        },
      };
    }
    // 2. 给实例上赋值
    setupComponent(instance);
    // 3. 创建组件渲染函数的effect
    setupRenderEffect(instance, container, anchor);
  };
  /**
   * 组件更新的入口：
   * 组件属性的更新
   * @param instance
   * @param next
   */
  const updateComponentPreRender = (instance, next) => {
    // 清空next
    instance.next = null;
    instance.vnode = next; // 更新渲染的vdom
    updateProps(instance.props, next.props); // 更新props
    // 更新插槽
    Object.assign(instance.slots, next.children);
  };
  const setupRenderEffect = (instance, container, anchor = null) => {
    // const { proxy, render } = instance;
    /**
     * 区分组件是挂载 还是更新
     */
    const componentUpdate = () => {
      if (!instance.isMounted) {
        const { bm, m } = instance;
        if (bm) {
          invokeArrayFns(bm);
        }
        // 组件初始化
        const subTree = (instance.subTree = renderComponent(instance)); // 作为this 后续this会修改
        patch(null, subTree, container, anchor, instance); // 创造subTree的真实DOM
        instance.isMounted = true;
        if (m) {
          invokeArrayFns(m);
        }
      } else {
        const { next, bu, u } = instance;
        if (next) {
          // 更新前 需要拿到最新的属性来进行更新
          updateComponentPreRender(instance, next);
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        // 更新
        const subTree = renderComponent(instance);
        patch(instance.subTree, subTree, container, anchor, instance);
        instance.subTree = subTree;
        if (u) {
          invokeArrayFns(u);
        }
      }
    };
    // 组件的异步更新
    const effect = new ReactiveEffect(componentUpdate, () =>
      queueJob(instance.update)
    );
    // 组件的强制更新 effect.run()
    const update = (instance.update = effect.run.bind(effect));
    update(); // 初次渲染
  };
  /**
   * 虚拟dom -> 真实DOM -> 挂载到页面
   * @param vnode
   * @param container
   */
  const mountElement = (
    vnode,
    container,
    anchor = null,
    parentComponent = null
  ) => {
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
      mountChildren(children, el, parentComponent);
    }
    // 挂载
    hostInsert(el, container, anchor);
  };
  /**
   * 挂载孩子节点
   * @param children
   * @param el
   */
  const mountChildren = (children, el, parentComponent = null) => {
    // if (children == null) return; // TODO Fragment 孩子可能为null的情况
    for (let i = 0; i < children.length; i++) {
      // TODO 如果孩子是一个普通文本 "hello" 包装 返回 让字符串变成字符串的虚拟DOM
      const child = normalize(children, i);
      patch(null, child, el, parentComponent);
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
  const unmount = (vnode, parentComponent = null) => {
    if (vnode.type === Fragment) {
      return unmountChildren(vnode, parentComponent);
    }
    if (vnode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
      // 不卸载组件
      return parentComponent.ctx.deactivate(vnode); // 把虚拟节点给keep-alive的deactivate方法
    }
    if (vnode.shapeFlag & ShapeFlags.COMPONENT) {
      // 卸载组件
      return unmountChildren(vnode.component.subTree.children, parentComponent);
    }
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
