/*
 * @Author: 毛毛
 * @Date: 2022-06-25 14:22:33
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-25 16:43:48
 */
import { activeEffect, track, trigger } from "./effect";
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}
export const mutableHandlers = {
  get(target, key, receiver) {
    // 用来判断是否是响应式对象
    // 对象没有被代理之前，没有该key，如果代理对象被用来二次代理，会在上面取值，然后get走到这里，返回true了
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    track(target, "get", key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    // 拿到老值
    const oldValue = Reflect.get(target, key, receiver);
    const flag = Reflect.set(target, key, value, receiver);
    // 判断值是否发生改变
    if (oldValue !== value) {
      // 数据发生改变 需要触发依赖当前属性值的副作用函数重新执行
      trigger(target, "set", key, value, oldValue);
    }
    return flag;
  },
} as ProxyHandler<object>;
