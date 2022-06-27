/*
 * @Author: 毛毛
 * @Date: 2022-06-26 17:23:58
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 17:53:35
 */

import { isArray, isObject } from "@vue/shared/src";
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

export const ref = <T>(value: T) => {
  return new RefImpl(value);
};

class RefImpl<T> {
  public __v_isRef = true;
  private _value: T;
  private rawValue: T; // 原始数据
  private dep: Set<ReactiveEffect> = new Set();
  constructor(_value: T) {
    this._value = toReactive(_value);
    this.rawValue = _value;
  }
  get value() {
    // 依赖收集
    trackEffects(this.dep);
    return this._value;
  }
  set value(newVal) {
    if (newVal !== this.rawValue) {
      this._value = toReactive(newVal);
      this.rawValue = newVal;
      // 触发更新
      triggerEffects(this.dep);
    }
  }
}
/**
 * 如果是对象 转为响应式对象
 * @param value
 */
const toReactive = (value: unknown) => {
  return isObject(value) ? reactive(value) : value;
};

export const toRef = <T>(object: T, key) => {
  return new ObjectRefImpl(object, key);
};

export const toRefs = <T>(object: object | T[]) => {
  const res = isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    res[key] = toRef(object, key);
  }
  return res;
};

class ObjectRefImpl {
  constructor(private object, private key) {}
  get value() {
    return this.object[this.key];
  }
  set value(newVal) {
    this.object[this.key] = newVal;
  }
}

export const proxyRefs = <T>(obj: RefImpl<T>) => {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // 看key是否是一个ref
      const res = Reflect.get(target, key, receiver);
      return res.__v_isRef ? res.value : res;
    },
    set(target, key, value, receiver) {
      const oldVal = Reflect.get(target, key);
      if (oldVal.__v_isRef) {
        oldVal.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
};
