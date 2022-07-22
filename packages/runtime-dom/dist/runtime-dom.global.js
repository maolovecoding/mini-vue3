var VueRuntimeDOM = (() => {
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

  // packages/runtime-dom/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    Fragment: () => Fragment,
    KeepAlive: () => KeepAliveImpl,
    LifeCycle: () => LifeCycle,
    ReactiveEffect: () => ReactiveEffect,
    Teleport: () => TeleportImpl,
    Text: () => Text,
    activeEffect: () => activeEffect,
    activeEffectScope: () => activeEffectScope,
    computed: () => computed,
    createComponentInstance: () => createComponentInstance,
    createElementBlock: () => createElementBlock,
    createElementVNode: () => createElementVNode,
    createHook: () => createHook,
    createRenderer: () => createRenderer,
    createVnode: () => createVnode,
    currentInstance: () => currentInstance,
    defineAsyncComponent: () => defineAsyncComponent,
    effect: () => effect,
    effectScope: () => effectScope,
    getCurrentInstance: () => getCurrentInstance,
    h: () => h,
    hasPropsChanged: () => hasPropsChanged,
    inject: () => inject,
    isKeepAlive: () => isKeepAlive,
    isReactive: () => isReactive,
    isSameVnode: () => isSameVnode,
    isTeleport: () => isTeleport,
    isVnode: () => isVnode,
    onBeforeMount: () => onBeforeMount,
    onBeforeUpdate: () => onBeforeUpdate,
    onMounted: () => onMounted,
    onUpdated: () => onUpdated,
    openBlock: () => openBlock,
    provide: () => provide,
    proxyRefs: () => proxyRefs,
    reactive: () => reactive,
    recordEffectScope: () => recordEffectScope,
    ref: () => ref,
    render: () => render,
    renderComponent: () => renderComponent,
    setCurrentInstance: () => setCurrentInstance,
    setupBlock: () => setupBlock,
    setupComponent: () => setupComponent,
    toDisplayString: () => toDisplayString,
    toRef: () => toRef,
    toRefs: () => toRefs,
    track: () => track,
    trackEffects: () => trackEffects,
    trigger: () => trigger,
    triggerEffects: () => triggerEffects,
    updateProps: () => updateProps,
    watch: () => watch
  });

  // packages/runtime-dom/src/nodeOps.ts
  var insert = (child, parent, anchor = null) => {
    parent.insertBefore(child, anchor);
  };
  var remove = (child) => {
    var _a;
    (_a = child == null ? void 0 : child.parentNode) == null ? void 0 : _a.removeChild(child);
  };
  var setElementText = (el, text) => {
    el.textContent = text;
  };
  var setText = (node, text) => {
    node.nodeValue = text;
  };
  var querySelector = (selector) => {
    return document.querySelector(selector);
  };
  var querySelectorAll = (selector) => {
    return document.querySelectorAll(selector);
  };
  var parentNode = (node) => {
    return node.parentNode;
  };
  var nextSibling = (node) => {
    return node.nextSibling;
  };
  var createElement = (tagName) => {
    return document.createElement(tagName);
  };
  var createText = (text) => {
    return document.createTextNode(text);
  };
  var createComment = (text) => {
    return document.createComment(text);
  };
  var nodeOps = {
    insert,
    remove,
    setElementText,
    setText,
    querySelector,
    querySelectorAll,
    parentNode,
    nextSibling,
    createElement,
    createText,
    createComment
  };

  // packages/runtime-dom/src/modules/attr.ts
  var patchAttr = (el, key, value) => {
    if (value) {
      el.setAttribute(key, value);
    } else {
      el.removeAttribute(key);
    }
  };

  // packages/runtime-dom/src/modules/class.ts
  var patchClass = (el, nextValue) => {
    if (nextValue == null) {
      el.removeAttribute("class");
    } else {
      el.className = nextValue;
    }
  };

  // packages/runtime-dom/src/modules/event.ts
  var patchEvent = (el, eventName, callback) => {
    let invokers = el._vei || (el._vei = {});
    const exits = invokers[eventName];
    if (exits && callback) {
      exits.value.add(callback);
    } else {
      const name = eventName.slice(2).toLowerCase();
      if (callback) {
        const invoker = invokers[eventName] = createInvoker(callback);
        el.addEventListener(name, invoker);
      } else if (exits) {
        el.removeEventListener(name, exits);
        delete invokers[eventName];
      }
    }
  };
  var createInvoker = (callback) => {
    const invoker = (e) => {
      invoker.value.forEach((fn) => fn(e));
    };
    invoker.value = (/* @__PURE__ */ new Set()).add(callback);
    return invoker;
  };

  // packages/runtime-dom/src/modules/style.ts
  var patchStyle = (el, prevValue, nextValue) => {
    for (const key in nextValue) {
      el.style[key] = nextValue[key];
    }
    if (prevValue) {
      if (!nextValue)
        return el.removeAttribute("style");
      for (const key in prevValue) {
        if (nextValue[key] == null)
          el.style[key] = null;
      }
    }
  };

  // packages/runtime-dom/src/patchProp.ts
  var patchProp = (el, key, prevValue, nextValue) => {
    if (key === "class") {
      patchClass(el, nextValue);
    } else if (key === "style") {
      patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
      patchEvent(el, key, nextValue);
    } else {
      patchAttr(el, key, nextValue);
    }
  };

  // packages/shared/src/index.ts
  var isObject = (val) => val != null && typeof val === "object";
  var isFunction = (val) => {
    return typeof val === "function";
  };
  var isString = (val) => {
    return typeof val === "string";
  };
  var isArray = Array.isArray;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (obj, key) => hasOwnProperty.call(obj, key);
  var invokeArrayFns = (fns) => {
    for (let i = 0; i < fns.length; i++) {
      fns[i]();
    }
  };

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

  // packages/runtime-core/src/componentProps.ts
  var initProps = (instance, rawProps) => {
    const props = {};
    const attrs = {};
    let options = instance.propsOptions || {};
    if (isArray(options)) {
      const res = {};
      for (const val of options) {
        res[val] = null;
      }
      options = res;
    }
    for (const key in rawProps) {
      const value = rawProps[key];
      if (hasOwn(options, key)) {
        if (options[key] !== null) {
          if (options[key].type && !(Object(value) instanceof options[key].type) || !(Object(value) instanceof options[key])) {
            console.warn(`${key} \u4E0D\u7B26\u5408\u7C7B\u578B\u7EA6\u675F\u8981\u6C42`);
          }
        }
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
    instance.props = reactive(props);
    instance.attrs = attrs;
    if (instance.vnode.shapeFlag & 2 /* FUNCTIONAL_COMPONENT */) {
      instance.props = attrs;
    }
  };

  // packages/runtime-core/src/componentSlots.ts
  var initSlots = (instance, children) => {
    if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
      instance.slots = children;
    }
  };

  // packages/runtime-core/src/component.ts
  var currentInstance = null;
  var setCurrentInstance = (instance) => {
    currentInstance = instance;
  };
  var getCurrentInstance = () => currentInstance;
  var createComponentInstance = (vnode, parent) => {
    const instance = {
      ctx: {},
      parent,
      provides: parent ? parent.provides : /* @__PURE__ */ Object.create(null),
      data: null,
      vnode,
      subTree: null,
      isMounted: false,
      update: null,
      propsOptions: vnode.type.props,
      props: {},
      attrs: {},
      proxy: null,
      render: null,
      next: null,
      setupState: null,
      slots: null
    };
    return instance;
  };
  var setupComponent = (instance) => {
    const { props, type, children } = instance.vnode;
    initProps(instance, props);
    initSlots(instance, children);
    instance.proxy = new Proxy(instance, publicInstanceProxyHandler);
    const data = type.data;
    if (data) {
      if (!isFunction(data)) {
        return console.warn(`data is must be a function`);
      }
      instance.data = reactive(data.call(instance.proxy));
    }
    const setup = type.setup;
    if (setup) {
      const setupContext = {
        emit(event, ...args) {
          const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
          const handler = instance.vnode.props[eventName];
          handler && handler(...args);
        },
        attrs: instance.attrs,
        slots: instance.slots
      };
      setCurrentInstance(instance);
      const setupResult = setup(instance.props, setupContext);
      setCurrentInstance(null);
      if (isFunction(setupResult)) {
        instance.render = setupResult;
      } else if (isObject(setupResult)) {
        instance.setupState = proxyRefs(setupResult);
      }
    }
    if (!isFunction(instance.render))
      instance.render = type.render;
  };
  var publicInstanceProxyHandler = {
    get(target, key, receiver) {
      const { data, props, setupState } = target;
      if (setupState && hasOwn(setupState, key))
        return Reflect.get(setupState, key);
      if (data && hasOwn(data, key))
        return Reflect.get(data, key);
      if (props && hasOwn(props, key))
        return Reflect.get(props, key);
      const getter = publicPropertyMap[key];
      if (getter)
        return getter(target);
    },
    set(target, key, value, receiver) {
      const { data, props, setupState } = target;
      if (setupState && hasOwn(setupState, key)) {
        return Reflect.set(setupState, key, value);
      }
      if (data && hasOwn(data, key)) {
        return Reflect.set(data, key, value);
      }
      if (props && hasOwn(props, key)) {
        console.warn(`\u4E0D\u5141\u8BB8\u4FEE\u6539 props ${String(key)} \u7684\u503C`);
        return false;
      }
    }
  };
  var publicPropertyMap = {
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots
  };
  var updateProps = (prevProps, nextProps) => {
    for (const key in nextProps) {
      prevProps[key] = nextProps[key];
    }
    for (const key in prevProps) {
      if (!hasOwn(nextProps, key)) {
        delete prevProps[key];
      }
    }
  };
  var hasPropsChanged = (prevProps = {}, nextProps = {}) => {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
      return true;
    }
    for (const key of nextKeys) {
      if (nextProps[key] !== prevProps[key])
        return true;
    }
    return false;
  };
  var renderComponent = (instance) => {
    const { vnode, render: render2, proxy, props } = instance;
    if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
      return render2.call(proxy, proxy);
    }
    return vnode.type(props);
  };

  // packages/runtime-core/src/apiLifecycle.ts
  var LifeCycle = /* @__PURE__ */ ((LifeCycle2) => {
    LifeCycle2["BEFORE_MOUNT"] = "bm";
    LifeCycle2["MOUNTED"] = "m";
    LifeCycle2["BEFORE_UPDATE"] = "bu";
    LifeCycle2["UPDATED"] = "u";
    return LifeCycle2;
  })(LifeCycle || {});
  var createHook = (type) => {
    return (hook, target = getCurrentInstance()) => {
      if (target) {
        const hooks = target[type] || (target[type] = []);
        hooks.push(() => {
          setCurrentInstance(target);
          hook();
          setCurrentInstance(null);
        });
      }
    };
  };
  var onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
  var onMounted = createHook("m" /* MOUNTED */);
  var onBeforeUpdate = createHook("bu" /* BEFORE_UPDATE */);
  var onUpdated = createHook("u" /* UPDATED */);

  // packages/runtime-core/src/components/Teleport.ts
  var TeleportImpl = {
    __isTeleport: true,
    process(n1, n2, container, anchor, internals) {
      const { mountChildren, patchChildren, move } = internals;
      if (!n1) {
        const target = document.querySelector(n2.props.to);
        if (target) {
          mountChildren(n2.children, target);
        }
      } else {
        patchChildren(n1, n2, container);
        if (n2.props.to !== n1.props.to) {
          const nextTarget = document.querySelector(n2.props.to);
          n2.children.forEach((child) => move(child, nextTarget));
        }
      }
    }
  };
  var isTeleport = (type) => type.__isTeleport;

  // packages/runtime-core/src/vnode.ts
  var isSameVnode = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  };
  var Text = Symbol("text");
  var Fragment = Symbol("fragment");
  var createVnode = (type, props, children = null, patchFlag = 0) => {
    const shapeFlag = isString(type) ? 1 /* ELEMENT */ : isTeleport(type) ? 64 /* TELEPORT */ : isFunction(type) ? 2 /* FUNCTIONAL_COMPONENT */ : isObject(type) ? 4 /* STATEFUL_COMPONENT */ : 0;
    let key;
    if (props == null ? void 0 : props.key) {
      key = props.key;
      delete props.key;
    }
    const vnode = {
      type,
      props,
      key,
      children,
      shapeFlag,
      el: null,
      __v_isVnode: true,
      patchFlag,
      dynamicChildren: null
    };
    if (children) {
      let type2 = 0;
      if (isArray(children)) {
        type2 = 16 /* ARRAY_CHILDREN */;
      } else if (isObject(children)) {
        type2 = 32 /* SLOTS_CHILDREN */;
      } else {
        children = String(children);
        type2 = 8 /* TEXT_CHILDREN */;
      }
      vnode.shapeFlag |= type2;
    }
    if (currentBlock && vnode.patchFlag > 0) {
      currentBlock.push(vnode);
    }
    return vnode;
  };
  var isVnode = (val) => {
    return !!(val == null ? void 0 : val.__v_isVnode);
  };
  var currentBlock = null;
  var openBlock = () => {
    currentBlock = [];
  };
  var createElementBlock = (type, props, children, patchFlag) => {
    return setupBlock(createVnode(type, props, children, patchFlag));
  };
  var setupBlock = (vnode) => {
    vnode.dynamicChildren = currentBlock;
    currentBlock = null;
    return vnode;
  };
  var toDisplayString = (value) => {
    return isString(value) ? value : isObject(value) ? JSON.stringify(value) : String(value);
  };
  var createElementVNode = createVnode;

  // packages/runtime-core/src/components/KeepAlive.ts
  var KeepAliveImpl = {
    __isKeepAlive: true,
    props: [
      "include",
      "exclude",
      "max"
    ],
    setup(props, { slots }) {
      console.log(props);
      const keys = /* @__PURE__ */ new Set();
      const cache = /* @__PURE__ */ new Map();
      const instance = getCurrentInstance();
      const { createElement: createElement2, move } = instance.ctx.renderer;
      const storageContainer = createElement2("div");
      instance.ctx.deactivate = (vnode) => {
        move(vnode, storageContainer);
      };
      instance.ctx.activate = (vnode, container, anchor) => {
        move(vnode, container, anchor);
      };
      let pendingCacheKey = null;
      const cacheSubTree = () => {
        if (pendingCacheKey !== null) {
          cache.set(pendingCacheKey, instance.subTree);
        }
      };
      onMounted(cacheSubTree);
      onUpdated(cacheSubTree);
      let currentVnode = null;
      const pruneCacheEntry = (key) => {
        cache.delete(key);
        keys.delete(key);
        resetShapeFlag(currentVnode);
      };
      return () => {
        var _a;
        const vnode = slots.default();
        if (!isVnode(vnode) || !(vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */)) {
          return vnode;
        }
        const cmp = vnode.type;
        const key = (_a = vnode.key) != null ? _a : cmp;
        const name = cmp.name;
        if (name && props.include && !props.include.includes(name) || props.exclude && props.exclude.includes(name)) {
          return vnode;
        }
        let cacheVnode = cache.get(key);
        if (cacheVnode) {
          vnode.component = cacheVnode;
          vnode.shapeFlag |= 512 /* COMPONENT_KEPT_ALIVE */;
          keys.delete(key);
          keys.add(key);
        } else {
          keys.add(key);
          pendingCacheKey = key;
          if (props.max && keys.size > props.max) {
            debugger;
            pruneCacheEntry(keys.values().next().value);
          }
        }
        vnode.shapeFlag |= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
        currentVnode = vnode;
        return vnode;
      };
    }
  };
  var resetShapeFlag = (vnode) => {
    let shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
      shapeFlag -= 256 /* COMPONENT_SHOULD_KEEP_ALIVE */;
    }
    if (shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
      shapeFlag -= 512 /* COMPONENT_KEPT_ALIVE */;
    }
    vnode.shapeFlag = shapeFlag;
  };
  var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;

  // packages/runtime-core/src/sequence.ts
  function getSequence(arr) {
    const res = [0];
    const len = arr.length;
    const p = arr.slice(0);
    let resLastIndex;
    for (let i2 = 0; i2 < len; i2++) {
      const arrI = arr[i2];
      if (arrI !== 0) {
        resLastIndex = res[res.length - 1];
        if (arr[resLastIndex] < arrI) {
          res.push(i2);
          p[i2] = resLastIndex;
          continue;
        }
        let start = 0, end = res.length - 1, middle;
        while (start < end) {
          middle = start + end >> 1;
          if (arr[res[middle]] < arrI) {
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (arr[res[start]] > arrI) {
          res[start] = i2;
          p[i2] = res[start - 1];
        }
      }
    }
    let i = res.length, last = res[i - 1];
    while (i--) {
      res[i] = last;
      last = p[last];
    }
    return res;
  }

  // packages/runtime-core/src/scheduler.ts
  var queue = [];
  var isFlushing = false;
  var resolvePromise = Promise.resolve();
  var queueJob = (job) => {
    if (!queue.includes(job))
      queue.push(job);
    if (!isFlushing) {
      isFlushing = true;
      resolvePromise.then(() => {
        isFlushing = false;
        const jobs = [...queue];
        queue.length = 0;
        jobs.forEach((j) => j());
      });
    }
  };

  // packages/runtime-core/src/renderer.ts
  var createRenderer = (renderOptions2) => {
    const {
      insert: hostInsert,
      remove: hostRemove,
      setElementText: hostSetElementText,
      setText: hostSetText,
      parentNode: hostParentNode,
      nextSibling: hostNextSibling,
      createElement: hostCreateElement,
      createText: hostCreateText,
      patchProp: hostPatchProp
    } = renderOptions2;
    const processText = (n1, n2, container) => {
      if (n1 == null) {
        n2.el = hostCreateText(n2.children);
        hostInsert(n2.el, container);
      } else {
        n2.el = n1.el;
        if (n1.children !== n2.children)
          hostSetText(n1.el, n2.children);
      }
    };
    const processElement = (n1, n2, container, anchor = null, parentComponent = null) => {
      if (n1 == null) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2, parentComponent);
      }
    };
    const patchElement = (n1, n2, parentComponent) => {
      var _a;
      const el = n2.el = n1.el;
      const oldProps = n1.props || {};
      const newProps = n2.props || {};
      const { patchFlag } = n2;
      if (patchFlag & 2 /* CLASS */) {
        if (oldProps.class !== newProps.class) {
          hostPatchProp(el, "class", oldProps, newProps);
        }
      } else {
        patchProps(oldProps, newProps, el);
      }
      if ((_a = n2.dynamicChildren) == null ? void 0 : _a.length) {
        patchBlockChildren(n1, n2, parentComponent);
      } else
        patchChildren(n1, n2, el, parentComponent);
    };
    const patchBlockChildren = (n1, n2, parentComponent) => {
      for (let i = 0; i < n2.dynamicChildren.length; i++) {
        patchElement(n1.dynamicChildren[i], n2.dynamicChildren[i], parentComponent);
      }
    };
    const patchProps = (oldProps, newProps, el) => {
      for (const key in newProps) {
        hostPatchProp(el, key, oldProps[key], newProps[key]);
      }
      for (const key in oldProps) {
        if (newProps[key] == null) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    };
    const patchChildren = (n1, n2, el, parentComponent) => {
      const c1 = n1.children;
      const c2 = n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const nextShapeFlag = n2.shapeFlag;
      if (nextShapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1, parentComponent);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (nextShapeFlag & 16 /* ARRAY_CHILDREN */) {
            patchKeyedChildren(c1, c2, el, parentComponent);
          } else {
            unmountChildren(c1, parentComponent);
          }
        } else {
          if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
            hostSetElementText(el, "");
          }
          if (nextShapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(c2, el);
          }
        }
      }
    };
    const patchKeyedChildren = (c1, c2, el, parentComponent = null) => {
      var _a, _b;
      let i = 0;
      let e1 = c1.length - 1;
      let e2 = c2.length - 1;
      while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i];
        if (isSameVnode(n1, n2)) {
          patch(n1, n2, el);
        } else {
          break;
        }
        i++;
      }
      while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        if (isSameVnode(n1, n2)) {
          patch(n1, n2, el);
        } else
          break;
        e1--;
        e2--;
      }
      if (i > e1) {
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = (_a = c2[nextPos]) == null ? void 0 : _a.el;
          patch(null, c2[i++], el, anchor);
        }
      } else if (i > e2) {
        while (i <= e1) {
          unmount(c1[i++]);
        }
      }
      let s1 = i, s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (let i2 = s2; i2 <= e2; i2++) {
        keyToNewIndexMap.set(c2[i2].key, i2);
      }
      let toBePatched = e2 - s2 + 1;
      const newIndexToOldIndex = new Array(toBePatched).fill(0);
      for (let i2 = s1; i2 <= e1; i2++) {
        const oldChild = c1[i2];
        const existIndex = keyToNewIndexMap.get(oldChild.key);
        if (!existIndex) {
          unmount(oldChild);
        } else {
          newIndexToOldIndex[existIndex - s2] = i2 + 1;
          patch(oldChild, c2[existIndex], el);
        }
      }
      const increment = getSequence(newIndexToOldIndex);
      let j = increment.length - 1;
      for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
        let index = s2 + i2;
        const current = c2[index];
        const anchor = (_b = c2[index + 1]) == null ? void 0 : _b.el;
        if (newIndexToOldIndex[i2] === 0) {
          patch(null, current, el, anchor);
        } else {
          if (i2 !== increment[j]) {
            hostInsert(current.el, el, anchor);
          } else {
            j--;
          }
        }
      }
    };
    const unmountChildren = (children, parentComponent = null) => {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i], parentComponent);
      }
    };
    const processFragment = (n1, n2, container, parentComponent = null) => {
      if (n1 == null) {
        mountChildren(n2.children, container, parentComponent);
      } else {
        patchChildren(n1, n2, container, parentComponent);
      }
    };
    const processComponent = (n1, n2, container, anchor = null, parentComponent = null) => {
      if (n1 == null) {
        if (n2.shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
          parentComponent.ctx.activate(n2.component, container, anchor);
        } else
          mountComponent(n2, container, anchor, parentComponent);
      } else {
        updateComponent(n1, n2);
      }
    };
    const updateComponent = (n1, n2) => {
      const instance = n2.component = n1.component;
      if (shouldUpdateComponent(n1, n2)) {
        instance.next = n2;
        instance.update();
      }
    };
    const shouldUpdateComponent = (n1, n2) => {
      const { props: prevProps, children: prevChildren } = n1;
      const { props: nextProps, children: nextChildren } = n2;
      if (prevChildren || nextChildren)
        return true;
      if (prevProps === nextProps)
        return false;
      return hasPropsChanged(prevProps, nextProps);
    };
    const patch = (n1, n2, container, anchor = null, parentComponent = null) => {
      if (n1 === n2)
        return;
      if (n1 && !isSameVnode(n1, n2)) {
        unmount(n1, parentComponent);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container, parentComponent);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */)
            processElement(n1, n2, container, anchor, parentComponent);
          else if (shapeFlag & 6 /* COMPONENT */) {
            processComponent(n1, n2, container, anchor, parentComponent);
          } else if (shapeFlag & 64 /* TELEPORT */) {
            type.process(n1, n2, container, anchor, {
              mountChildren,
              patchChildren,
              move(vnode, container2) {
                hostInsert(vnode.component ? vnode.component.subTree.el : vnode.el, container2);
              }
            });
          }
      }
    };
    const mountComponent = (vnode, container, anchor = null, parentComponent = null) => {
      const instance = vnode.component = createComponentInstance(vnode, parentComponent);
      if (isKeepAlive(vnode)) {
        instance.ctx.renderer = {
          createElement: hostCreateElement,
          move(vnode2, container2, anchor2) {
            hostInsert(vnode2.component.subTree.el, container2, anchor2);
          }
        };
      }
      setupComponent(instance);
      setupRenderEffect(instance, container, anchor);
    };
    const updateComponentPreRender = (instance, next) => {
      instance.next = null;
      instance.vnode = next;
      updateProps(instance.props, next.props);
      Object.assign(instance.slots, next.children);
    };
    const setupRenderEffect = (instance, container, anchor = null) => {
      const componentUpdate = () => {
        if (!instance.isMounted) {
          const { bm, m } = instance;
          if (bm) {
            invokeArrayFns(bm);
          }
          const subTree = instance.subTree = renderComponent(instance);
          patch(null, subTree, container, anchor, instance);
          instance.isMounted = true;
          if (m) {
            invokeArrayFns(m);
          }
        } else {
          const { next, bu, u } = instance;
          if (next) {
            updateComponentPreRender(instance, next);
          }
          if (bu) {
            invokeArrayFns(bu);
          }
          const subTree = renderComponent(instance);
          patch(instance.subTree, subTree, container, anchor, instance);
          instance.subTree = subTree;
          if (u) {
            invokeArrayFns(u);
          }
        }
      };
      const effect2 = new ReactiveEffect(componentUpdate, () => queueJob(instance.update));
      const update = instance.update = effect2.run.bind(effect2);
      update();
    };
    const mountElement = (vnode, container, anchor = null, parentComponent = null) => {
      const { type, props, children, shapeFlag } = vnode;
      const el = vnode.el = hostCreateElement(type);
      if (props) {
        for (const key in props) {
          hostPatchProp(el, key, null, props[key]);
        }
      }
      if (shapeFlag & 8 /* TEXT_CHILDREN */) {
        hostSetElementText(el, children);
      } else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
        mountChildren(children, el, parentComponent);
      }
      hostInsert(el, container, anchor);
    };
    const mountChildren = (children, el, parentComponent = null) => {
      for (let i = 0; i < children.length; i++) {
        const child = normalize(children, i);
        patch(null, child, el, parentComponent);
      }
    };
    const normalize = (children, index) => {
      if (isString(children[index]))
        return children[index] = createVnode(Text, null, children[index]);
      return children[index];
    };
    const unmount = (vnode, parentComponent = null) => {
      if (vnode.type === Fragment) {
        return unmountChildren(vnode, parentComponent);
      }
      if (vnode.shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
        return parentComponent.ctx.deactivate(vnode);
      }
      if (vnode.shapeFlag & 6 /* COMPONENT */) {
        return unmountChildren(vnode.component.subTree.children, parentComponent);
      }
      hostRemove(vnode.el);
    };
    const render2 = (vnode, container) => {
      if (vnode == null) {
        if (container._vnode)
          unmount(container._vnode);
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  };

  // packages/runtime-core/src/h.ts
  var h = function h2(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVnode(propsOrChildren)) {
          return createVnode(type, null, [propsOrChildren]);
        }
        return createVnode(type, propsOrChildren);
      } else {
        return createVnode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVnode(children)) {
        children = [children];
      }
      return createVnode(type, propsOrChildren, children);
    }
  };

  // packages/runtime-core/src/apiInject.ts
  var provide = (key, value) => {
    var _a;
    if (!currentInstance) {
      throw new TypeError("\u9700\u8981\u5728 setup \u51FD\u6570\u4E2D\u4F7F\u7528 provide \u51FD\u6570");
    }
    const parentProvides = (_a = currentInstance.parent) == null ? void 0 : _a.provides;
    let provides = currentInstance.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(provides);
    }
    provides[key] = value;
  };
  var inject = (key, defaultValue) => {
    var _a;
    if (!currentInstance) {
      throw new TypeError("\u9700\u8981\u5728 setup \u51FD\u6570\u4E2D\u4F7F\u7528 inject \u51FD\u6570");
    }
    const provides = (_a = currentInstance.parent) == null ? void 0 : _a.provides;
    if (provides && key in provides) {
      return provides[key];
    }
    return defaultValue;
  };

  // packages/runtime-core/src/defineAsyncComponent.ts
  var defineAsyncComponent = (options) => {
    if (isFunction(options)) {
      options = { loader: options };
    }
    return {
      setup() {
        const loaded = ref(false);
        const error = ref(false);
        const delayLoading = ref(false);
        const {
          loader,
          timeout = Infinity,
          delay = 200,
          loadingComponent,
          errorComponent,
          onError
        } = options;
        setTimeout(() => {
          if (!loaded.value) {
            error.value = true;
          }
        }, timeout);
        setTimeout(() => {
          if (!loaded.value) {
            delayLoading.value = true;
          }
        }, delay);
        let Cmp;
        const load = () => {
          return loader().catch((err) => {
            if (onError) {
              return new Promise((resolve, reject) => {
                const retry = () => resolve(load());
                const fail = () => reject(err);
                onError(err, retry, fail);
              });
            }
          });
        };
        load().then((cmp) => {
          Cmp = cmp;
          loaded.value = true;
        }).catch().finally(() => delayLoading.value = false);
        return () => {
          if (loaded.value && Cmp)
            return h(Cmp);
          if (error.value && errorComponent)
            return h(errorComponent);
          if (delayLoading.value && loadingComponent)
            return h(loadingComponent);
          return h(Fragment, []);
        };
      }
    };
  };

  // packages/runtime-dom/src/index.ts
  var renderOptions = Object.assign({}, nodeOps, { patchProp });
  var render = (vnode, container) => {
    createRenderer(renderOptions).render(vnode, container);
  };
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
