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
    activeEffectScope: () => activeEffectScope,
    computed: () => computed,
    effect: () => effect,
    effectScope: () => effectScope,
    isReactive: () => isReactive,
    proxyRefs: () => proxyRefs,
    reactive: () => reactive,
    recordEffectScope: () => recordEffectScope,
    ref: () => ref,
    toRef: () => toRef,
    toRefs: () => toRefs,
    track: () => track,
    trackEffects: () => trackEffects,
    trigger: () => trigger,
    triggerEffects: () => triggerEffects,
    watch: () => watch
  });

  // packages/shared/src/index.ts
  var isObject = (val) => val != null && typeof val === "object";
  var isFunction = (val) => {
    return typeof val === "function";
  };
  var isArray = Array.isArray;

  // packages/reactivity/src/effectScope.ts
  var activeEffectScope = null;
  var effectScope = (detached = false) => {
    return new EffectScope(detached);
  };
  var EffectScope = class {
    constructor(detached) {
      this.active = true;
      this.parent = null;
      this.effects = [];
      this.scopes = [];
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
          this.effects[i].stop();
        }
        for (let i = 0; i < this.scopes.length; i++) {
          this.scopes[i].stop();
        }
        this.active = false;
      }
    }
  };
  var recordEffectScope = (effect2) => {
    if (activeEffectScope == null ? void 0 : activeEffectScope.active) {
      activeEffectScope.effects.push(effect2);
    }
  };

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
      recordEffectScope(this);
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
    trackEffects(dep);
  };
  var trackEffects = (dep) => {
    if (!activeEffect)
      return;
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
      triggerEffects(effects);
    }
  };
  var triggerEffects = (effects) => {
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
  };

  // packages/reactivity/src/baseHandler.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, "get", key);
      const value = Reflect.get(target, key, receiver);
      if (isObject(value)) {
        return reactive(value);
      }
      return value;
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
  var isReactive = (val) => {
    return !!(val && val["__v_isReactive" /* IS_REACTIVE */]);
  };

  // packages/reactivity/src/computed.ts
  var computed = (getterOrOptions) => {
    const onlyGetter = isFunction(getterOrOptions);
    let getter;
    let setter;
    if (onlyGetter) {
      getter = getterOrOptions;
      setter = () => {
        console.warn(`\u4E0D\u80FD\u4FEE\u6539\u4E00\u4E2A\u53EA\u8BFB\u7684\u8BA1\u7B97\u5C5E\u6027\u7684\u503C\uFF01`);
      };
    } else {
      getter = getterOrOptions.get;
      setter = getterOrOptions.set;
    }
    return new ComputedRefImpl(getter, setter);
  };
  var ComputedRefImpl = class {
    constructor(getter, setter) {
      this.getter = getter;
      this.setter = setter;
      this._dirty = true;
      this.__v_isReadonly = true;
      this.__v_isRef = true;
      this.effect = new ReactiveEffect(getter, (effect2) => {
        if (!this._dirty) {
          this._dirty = true;
          triggerEffects(this.dep);
        }
      });
    }
    get value() {
      trackEffects(this.dep || (this.dep = /* @__PURE__ */ new Set()));
      if (this._dirty) {
        this._value = this.effect.run();
        this._dirty = false;
      }
      return this._value;
    }
    set value(newVal) {
      this.setter(newVal);
    }
  };

  // packages/reactivity/src/watch.ts
  var watch = (source, callback, { immediate = false, deep = false } = {}) => {
    let getter;
    let oldVal;
    if (isFunction(source)) {
      getter = source;
    } else if (isReactive(source)) {
      getter = () => traversal(source);
    }
    let cleanupCb;
    const onCleanup = (cb) => {
      cleanupCb = cb;
    };
    const job = () => {
      if (cleanupCb) {
        cleanupCb();
        cleanupCb = null;
      }
      const newVal = effect2.run();
      callback(oldVal, newVal, onCleanup);
      oldVal = newVal;
    };
    const effect2 = new ReactiveEffect(getter, job);
    oldVal = effect2.run();
    if (immediate) {
      callback(oldVal, void 0, onCleanup);
    }
  };
  var traversal = (val, set = /* @__PURE__ */ new WeakSet()) => {
    if (!isObject(val))
      return val;
    if (set.has(val))
      return val;
    set.add(val);
    for (const key in val) {
      traversal(val[key]);
    }
    return val;
  };

  // packages/reactivity/src/ref.ts
  var ref = (value) => {
    return new RefImpl(value);
  };
  var RefImpl = class {
    constructor(_value) {
      this.__v_isRef = true;
      this.dep = /* @__PURE__ */ new Set();
      this._value = toReactive(_value);
      this.rawValue = _value;
    }
    get value() {
      trackEffects(this.dep);
      return this._value;
    }
    set value(newVal) {
      if (newVal !== this.rawValue) {
        this._value = toReactive(newVal);
        this.rawValue = newVal;
        triggerEffects(this.dep);
      }
    }
  };
  var toReactive = (value) => {
    return isObject(value) ? reactive(value) : value;
  };
  var toRef = (object, key) => {
    return new ObjectRefImpl(object, key);
  };
  var toRefs = (object) => {
    const res = isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
      res[key] = toRef(object, key);
    }
    return res;
  };
  var ObjectRefImpl = class {
    constructor(object, key) {
      this.object = object;
      this.key = key;
    }
    get value() {
      return this.object[this.key];
    }
    set value(newVal) {
      this.object[this.key] = newVal;
    }
  };
  var proxyRefs = (obj) => {
    return new Proxy(obj, {
      get(target, key, receiver) {
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
      }
    });
  };
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
