var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    ReactiveEffect: () => ReactiveEffect,
    activeEffect: () => activeEffect,
    effect: () => effect,
    reactive: () => reactive,
    track: () => track,
    trigger: () => trigger
  });

  // packages/shared/src/index.ts
  var isObject = (val) => val != null && typeof val === "object";

  // packages/reactivity/src/effect.ts
  function effect(fn, options) {
    const _effect = new ReactiveEffect(fn, options == null ? void 0 : options.scheduler);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
  }
  var activeEffect = null;
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.parent = null;
      this.deps = [];
      this.active = true;
    }
    run() {
      let res;
      if (!this.active) {
        return this.fn();
      }
      try {
        this.parent = activeEffect;
        activeEffect = this;
        cleanupEffect(this);
        res = this.fn();
      } finally {
        activeEffect = this.parent;
        this.parent = null;
      }
      return res;
    }
    stop() {
      if (this.active) {
        this.active = false;
        cleanupEffect(this);
      }
    }
  };
  var cleanupEffect = (effect2) => {
    const { deps } = effect2;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect2);
    }
    effect2.deps.length = 0;
  };
  var targetMap = /* @__PURE__ */ new WeakMap();
  var track = (target, type, key) => {
    if (!activeEffect)
      return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    const shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  };
  var trigger = (target, type, key, value, oldValue) => {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = depsMap.get(key);
    if (effects) {
      const fns = [...effects];
      fns.forEach((effect2) => {
        if (effect2 !== activeEffect) {
          if (effect2.scheduler) {
            effect2.scheduler(effect2);
          } else {
            effect2.run();
          }
        }
      });
    }
  };

  // packages/reactivity/src/baseHandler.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, "get", key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const flag = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, "set", key, value, oldValue);
      }
      return flag;
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target))
      return;
    const existingProxy = reactiveMap.get(target);
    if (existingProxy)
      return existingProxy;
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
