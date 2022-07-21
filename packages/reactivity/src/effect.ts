/*
 * @Author: 毛毛
 * @Date: 2022-06-25 14:00:05
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 14:42:39
 */

import { recordEffectScope } from "./effectScope";

/**
 * 传入的副作用函数类型
 * @returns {Function}
 */
type effectFn = () => any;
interface EffectOptions {
  scheduler?: EffectScheduler;
}
// 调度器
type EffectScheduler = (effect: ReactiveEffect) => any;

/**
 * 创建响应式的effect
 * @param fn 副作用函数
 * @param options 配置对象
 * @returns
 */
export function effect(fn: effectFn, options?: EffectOptions) {
  // 创建响应式的effect
  const _effect = new ReactiveEffect(fn, options?.scheduler);
  // 默认先执行一次副作用函数
  _effect.run();
  // effect函数的返回值就是一个runner 可以让失活的effect再次执行 只是需要手动触发执行了(不会自动开始收集依赖)
  const runner = _effect.run.bind(_effect); // 绑定this
  runner.effect = _effect; // 将effect挂载到runner上
  return runner;
}
/**
 * 当前正在执行副作用函数暴露出去
 */
export let activeEffect: ReactiveEffect = null;
/**
 * 把副作用函数包装为响应式的effect函数
 */
export class ReactiveEffect {
  /**
   * 记录父ReactiveEffect
   *
   * @type {ReactiveEffect}
   * @memberof ReactiveEffect
   */
  parent: ReactiveEffect = null;

  deps: Set<ReactiveEffect>[] = [];
  /**
   * 这个effect默认是激活状态
   *
   * @memberof ReactiveEffect
   */
  active = true;
  constructor(public fn: effectFn, public scheduler?: EffectScheduler) {
    // effectScope进行收集effect
    recordEffectScope(this)
  }
  /**
   *
   * run 方法 就是执行传入的副作用函数
   * @memberof ReactiveEffect
   */
  run() {
    let res;
    // 激活状态 才需要收集这个副作用函数fn内用到的响应式数据 也就是我们说的依赖收集
    // 非激活状态 只执行函数 不收集依赖
    if (!this.active) {
      return this.fn();
    }
    try {
      // 激活状态 依赖收集了 核心就是将当前的effect和稍后渲染的属性关联在一起
      this.parent = activeEffect;
      activeEffect = this;
      // TODO 在执行fn之前，清除此副作用函数依赖的属性set集合中 对当前effect的关联 也就是让 每个dep都去掉对当前effect的引用
      cleanupEffect(this);
      // 执行传入的fn的时候，如果出现了响应式数据的获取操作，就可以获取到这个全局的activeEffect
      res = this.fn();
    } finally {
      // 执行完当前的effect 归还上次 activeEffect 变量指向的值
      activeEffect = this.parent;
      this.parent = null;
    }
    return res;
  }
  /**
   * 取消副作用函数的激活 不再收集依赖 且将effect上的deps清空
   * @description 在vue3.2新增了一个 scopeEffect
   */
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this);
    }
  }
}
/**
 * 清除effect收集的dep set里 每个属性对当前effect的收集
 * @param effect
 */
const cleanupEffect = (effect: ReactiveEffect) => {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    // 解除key -> effect的关联 执行effect的时候重新收集
    deps[i].delete(effect);
  }
  // 清空当前effect依赖的dep
  effect.deps.length = 0;
};

type Operator = "get" | "set";

const targetMap = new WeakMap<object, Map<keyof any, Set<ReactiveEffect>>>();
/**
 * 依赖收集函数
 * @param target
 * @param type
 * @param key
 */
export const track = (target: object, type: Operator, key: keyof any) => {
  // 不是在effect使用，不需要收集依赖
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  trackEffects(dep);
};
/**
 * 收集当前正在执行的effect 放入dep中
 * @param dep
 * @returns
 */
export const trackEffects = (dep: Set<ReactiveEffect>) => {
  if (!activeEffect) return;
  // 判断是否有当前activeEffect
  // 已经收集过 不需要再次收集 这种情况一般是一个副作用函数中多次使用了该属性
  const shouldTrack = !dep.has(activeEffect);
  if (shouldTrack) {
    // key -> effect [eff1,eff2,...]
    dep.add(activeEffect);
    // 后续方便进行清理操作
    activeEffect.deps.push(dep);
  }
};

/**
 * 触发更新
 * @param target
 * @param type 操作类型
 * @param key
 * @param value
 * @param oldValue
 */
export const trigger = (
  target: object,
  type: Operator,
  key: keyof any,
  value?: unknown,
  oldValue?: unknown
) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // 在模板中 没有用过这个对象
    return;
  }
  // 拿到属性对应的set effects
  const effects = depsMap.get(key);
  // 防止死循环 刚删除的引用马上又添加进来
  if (effects) {
    triggerEffects(effects);
  }
};
/**
 * 触发执行effects
 * @param effects
 */
export const triggerEffects = (effects: Set<ReactiveEffect>) => {
  // 把依赖effects拷贝一份 我们的执行操作在这个数组上 不直接操作原set集合了
  const fns = [...effects];
  fns.forEach((effect) => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        // 用户传入了调度函数，使用用户的
        effect.scheduler(effect);
      } else {
        effect.run();
      }
    }
  });
};
