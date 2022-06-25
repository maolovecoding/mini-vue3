import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandler";
/*
 * @Author: 毛毛
 * @Date: 2022-06-25 13:50:54
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-25 14:24:32
 */
// 缓存已经代理过后的响应式对象
const reactiveMap = new WeakMap();

/**
 * 代理对象为响应式
 * @param obj
 */
export function reactive(target: unknown) {
  if (!isObject(target)) return;
  const existingProxy = reactiveMap.get(target);
  // 目标对象被代理过 返回同一个代理
  if (existingProxy) return existingProxy;
  // 第一个普通对象 创建代理
  // 如果传入的对象 是已经被代理过的对象 我们可以看看这个对象是否有get方法，有表示已经是代理对象
  if (target[ReactiveFlags.IS_REACTIVE]) {
    // TODO 取到true 就返回自身 源码这一步很妙
    return target;
  }
  // 创建代理对象
  const proxy = new Proxy(target, mutableHandlers);
  // 已经代理的对象进行缓存 如果再次代理同一个对象 返回同一个代理
  reactiveMap.set(target, proxy);
  return proxy;
}
