import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";
import { isFunction, isObject } from "@vue/shared";
/**
 * @Author: 毛毛
 * @Date: 2022-06-26 15:15:59
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 16:44:17
 * @description watch API 实际是不在reactivity 包里面的
 */
type WatchTarget = object | (() => any);
type WatchCallback = (
  newVal,
  oldVal,
  onCleanup?: (callback: () => void) => void
) => any;
interface WatchOptions {
  immediate?: boolean;
  deep?: boolean;
}
/**
 *
 * @param source 对象 或者 getter函数
 * @param callback 回调函数
 */
export const watch = (
  source: WatchTarget,
  callback: WatchCallback,
  { immediate = false, deep = false }: WatchOptions = {}
) => {
  let getter;
  let oldVal;
  if (isFunction(source)) {
    getter = source;
  } else if (isReactive(source)) {
    // 是一个响应式对象 需要对该对象的所有属性进行循环访问一次 递归循环
    getter = () => traversal(source);
  }
  // 保存用户传入的清理函数
  let cleanupCb: null | (() => void);
  const onCleanup = (cb: () => void) => {
    cleanupCb = cb;
  };
  const job = () => {
    // 在下次watch触发effect的执行前 先执行用户传入的回调
    if (cleanupCb) {
      cleanupCb();
      cleanupCb = null;
    }
    // 新值
    const newVal = effect.run();
    callback(oldVal, newVal, onCleanup);
    oldVal = newVal;
  };
  const effect = new ReactiveEffect(getter, job);
  // 记录老值
  oldVal = effect.run();
  if (immediate) {
    // 立即执行一次回调
    callback(oldVal, undefined, onCleanup);
  }
};

/**
 * 考虑循环引用 遍历对象的每一个属性
 * @param val
 * @param set
 */
const traversal = (val: object, set = new WeakSet()) => {
  if (!isObject(val)) return val;
  if (set.has(val)) return val;
  set.add(val);
  for (const key in val) {
    traversal(val[key]);
  }
  return val;
};
