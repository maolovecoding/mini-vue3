/**
 * 正在激活状态的 EffectScope
 */
export let activeEffectScope: EffectScope | null = null;
/**
 * 作用域scope
 */
export const effectScope = (detached: boolean = false) => {
  return new EffectScope(detached);
};
class EffectScope {
  // 默认情况表示激活状态 也就是可以进行依赖收集
  active = true;
  parent: EffectScope = null; // 当前scope的父scope
  effects = []; // 此scope记录的effect
  scopes = []; // scope可能要收集子级的effectScope
  constructor(detached: boolean) {
    // 只有不独立的才要收集
    if (!detached && activeEffectScope) {
      activeEffectScope.scopes.push(this);
    }
  }
  run(fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope;
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = this.parent;
      }
    }
  }
  stop() {
    if (this.active) {
      for (let i = 0; i < this.effects.length; i++) {
        // 把每个effect都暂停依赖收集
        this.effects[i].stop();
      }
      for (let i = 0; i < this.scopes.length; i++) {
        // 如果嵌套的子scope不是独立的 也会停止依赖收集
        this.scopes[i].stop();
      }
      this.active = false;
    }
  }
}
/**
 * 收集 effect
 * @param effect
 */
export const recordEffectScope = (effect) => {
  if (activeEffectScope?.active) {
    activeEffectScope.effects.push(effect);
  }
};
