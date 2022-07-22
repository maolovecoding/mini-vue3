/*
 * @Author: 毛毛
 * @Date: 2022-06-28 08:13:04
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-29 11:05:00
 */
import {
  isString,
  ShapeFlags,
  isArray,
  isObject,
  PatchFlags,
} from "@vue/shared";
import { isTeleport } from "./components";
/**
 * 判断两个节点是否是相同节点 （是否可复用）
 * @param n1
 * @param n2
 */
export const isSameVnode = (n1, n2) => {
  return n1.type === n2.type && n1.key === n2.key;
};
// 文本节点
export const Text = Symbol("text");
// 空节点
export const Fragment = Symbol("fragment");
/**
 * 虚拟节点有很多 组件 元素 文本 等
 * @param type
 * @param props
 * @param children
 */
export const createVnode = (
  type: string | symbol,
  props,
  children = null,
  patchFlag: PatchFlags = 0
) => {
  // 组合方案 shapeFlag 一个元素中包含的是多个儿子 还是一个儿子
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isTeleport(type)
    ? ShapeFlags.TELEPORT// 是teleport
    : isObject(type) // 是组件
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0;
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
    patchFlag,
    dynamicChildren: null, // 动态孩子节点
  };
  if (children) {
    let type = 0;
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else if (isObject(children)) {
      // 组件 插槽
      type = ShapeFlags.SLOTS_CHILDREN;
    } else {
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }
  // 收集动态节点
  if (currentBlock && vnode.patchFlag > 0) {
    currentBlock.push(vnode);
  }
  return vnode;
};

export const isVnode = (val) => {
  return !!val?.__v_isVnode;
};

let currentBlock = null;
/**
 * 用一个数组收集多个动态节点
 */
export const openBlock = () => {
  currentBlock = [];
};
export const createElementBlock = (
  type,
  props,
  children,
  patchFlag: PatchFlags
) => {
  return setupBlock(createVnode(type, props, children, patchFlag));
};
export const setupBlock = (vnode: ReturnType<typeof createVnode>) => {
  // 动态孩子节点
  vnode.dynamicChildren = currentBlock;
  currentBlock = null;
  return vnode;
};
export const toDisplayString = (value) => {
  return isString(value)
    ? value
    : isObject(value)
    ? JSON.stringify(value)
    : String(value);
};
export const createElementVNode = createVnode;
