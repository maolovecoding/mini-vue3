import {
  ReactiveEffect,
  track,
  trackEffects,
  trigger,
  triggerEffects,
} from "./effect";
import { isFunction } from "@vue/shared";

/*
 * @Author: 毛毛
 * @Date: 2022-06-26 13:48:11
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 14:43:46
 */
type ComputedGetter = () => any;
type ComputedSetter = (newVal) => void;
type ComputedOptions =
  | ComputedGetter
  | {
      get: ComputedGetter;
      set: ComputedSetter;
    };
export const computed = (getterOrOptions: ComputedOptions) => {
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = () => {
      console.warn(`不能修改一个只读的计算属性的值！`);
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
};

/**
 * 计算属性的实现
 */
class ComputedRefImpl {
  private effect: ReactiveEffect;
  // 默认是脏数据 取值的时候会重新计算
  private _dirty = true;
  // 只读
  private __v_isReadonly = true;
  // ref
  private __v_isRef = true;
  // 缓存的计算属性值
  private _value;
  // 依赖的effects
  private dep: Set<ReactiveEffect>;
  constructor(public getter: ComputedGetter, public setter: ComputedSetter) {
    /*
      计算属性内部就是通过可响应式的effect实现的，通过调度器来自己执行getter
      执行getter的时候 很显然会收集依赖 在依赖变更的时候 会执行我们的调度函数
    */
    this.effect = new ReactiveEffect(getter, (effect) => {
      // 依赖的属性变化 会执行该调度函数
      if (!this._dirty) {
        this._dirty = true;
        // 触发更新
        triggerEffects(this.dep);
      }
    });
  }
  /**
   * 类的属性访问器 -> 其实就是 definePrototype
   *
   * @memberof ComputedRefImpl
   */
  get value() {
    // 收集依赖
    trackEffects(this.dep || (this.dep = new Set()));
    // 先判断是否是脏值
    if (this._dirty) {
      this._value = this.effect.run();
      // 计算最新值了  不是脏值了
      this._dirty = false;
    }
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
}
