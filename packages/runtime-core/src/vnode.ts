/*
 * @Author: 毛毛
 * @Date: 2022-06-28 08:13:04
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-28 11:12:49
 */
import { isString, ShapeFlags, isArray } from "@vue/shared";
/**
 * 判断两个节点是否是相同节点 （是否可复用）
 * @param n1
 * @param n2
 */
export const isSameVnode = (n1, n2) => {
  return n1.type === n2.type && n1.key === n2.key;
};

export const Text = Symbol("text");
/**
 * 虚拟节点有很多 组件 元素 文本 等
 * @param type
 * @param props
 * @param children
 */
export const createVnode = (type: string | symbol, props, children = null) => {
  // 组合方案 shapeFlag 一个元素中包含的是多个儿子 还是一个儿子
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  let key;
  if (props?.key) {
    key = props.key;
    delete props.key;
  }
  // 虚拟DOM
  const vnode = {
    type,
    props,
    key,
    children,
    shapeFlag,
    el: null, // 真实DOM元素节点
    __v_isVnode: true, // 标识
  };
  if (children) {
    let type = 0;
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }
  return vnode;
};

export const isVnode = (val) => {
  return !!val?.__v_isVnode;
};
