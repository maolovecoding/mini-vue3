/*
 * @Author: 毛毛
 * @Date: 2022-06-25 14:00:05
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-25 16:45:55
 */
/**
 * 传入的副作用函数类型
 */
type effectFn = () => any;
export function effect(fn: effectFn) {
  // 创建响应式的effect
  const _effect = new ReactiveEffect(fn);
  // 默认先执行一次副作用函数
  const res = _effect.run();
  return res;
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
  constructor(public fn: effectFn) {}
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
      res = this.fn();
    }
    try {
      // 激活状态 依赖收集了 核心就是将当前的effect和稍后渲染的属性关联在一起
      this.parent = activeEffect;
      activeEffect = this;
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
   * 取消副作用函数的激活 不再收集依赖
   */
  stop() {
    this.active = false;
  }
}

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
  value: unknown,
  oldValue: unknown
) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // 在模板中 没有用过这个对象
    return;
  }
  // 拿到属性对应的set effects
  const effects = depsMap.get(key);
  effects &&
    effects.forEach((effect) => {
      if (effect !== activeEffect) effect.run();
    });
};
