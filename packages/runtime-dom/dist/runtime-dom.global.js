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
    Text: () => Text,
    createRenderer: () => createRenderer,
    createVnode: () => createVnode,
    h: () => h,
    isSameVnode: () => isSameVnode,
    isVnode: () => isVnode,
    render: () => render
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

  // packages/runtime-core/src/vnode.ts
  var isSameVnode = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  };
  var Text = Symbol("text");
  var Fragment = Symbol("fragment");
  var createVnode = (type, props, children = null) => {
    const shapeFlag = isString(type) ? 1 /* ELEMENT */ : isObject(type) ? 4 /* STATEFUL_COMPONENT */ : 0;
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
      __v_isVnode: true
    };
    if (children) {
      let type2 = 0;
      if (isArray(children)) {
        type2 = 16 /* ARRAY_CHILDREN */;
      } else {
        children = String(children);
        type2 = 8 /* TEXT_CHILDREN */;
      }
      vnode.shapeFlag |= type2;
    }
    return vnode;
  };
  var isVnode = (val) => {
    return !!(val == null ? void 0 : val.__v_isVnode);
  };

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

  // packages/reactivity/src/effect.ts
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
  var cleanupEffect = (effect) => {
    const { deps } = effect;
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    effect.deps.length = 0;
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
    fns.forEach((effect) => {
      if (effect !== activeEffect) {
        if (effect.scheduler) {
          effect.scheduler(effect);
        } else {
          effect.run();
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
  };

  // packages/runtime-core/src/component.ts
  var createComponentInstance = (vnode) => {
    const instance = {
      data: null,
      vnode,
      subTree: null,
      isMounted: false,
      update: null,
      propsOptions: vnode.type.props,
      props: {},
      attrs: {},
      proxy: null,
      render: null
    };
    return instance;
  };
  var setupComponent = (instance) => {
    const { props, type } = instance.vnode;
    initProps(instance, props);
    instance.proxy = new Proxy(instance, publicInstanceProxyHandler);
    const data = type.data;
    if (data) {
      if (!isFunction(data)) {
        return console.warn(`data is must be a function`);
      }
      instance.data = reactive(data.call(instance.proxy));
    }
    instance.render = type.render;
  };
  var publicInstanceProxyHandler = {
    get(target, key, receiver) {
      const { data, props } = target;
      if (data && hasOwn(data, key))
        return Reflect.get(data, key);
      if (props && hasOwn(props, key))
        return Reflect.get(props, key);
      const getter = publicPropertyMap[key];
      if (getter)
        return getter(target);
    },
    set(target, key, value, receiver) {
      const { data, props } = target;
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
    $attrs: (i) => i.attrs
  };
  var updateProps = (instance, prevProps, nextProps) => {
    if (hasPropsChanged(prevProps, nextProps)) {
      for (const key in nextProps) {
        instance.props[key] = nextProps[key];
      }
      for (const key in instance.props) {
        if (!hasOwn(nextProps, key)) {
          delete instance.props[key];
        }
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
    const processElement = (n1, n2, container, anchor = void 0) => {
      if (n1 == null) {
        mountElement(n2, container, anchor);
      } else {
        patchElement(n1, n2, container);
      }
    };
    const patchElement = (n1, n2, container) => {
      const el = n2.el = n1.el;
      const oldProps = n1.props || {};
      const newProps = n2.props || {};
      patchProps(oldProps, newProps, el);
      patchChildren(n1, n2, el);
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
    const patchChildren = (n1, n2, el) => {
      const c1 = n1.children;
      const c2 = n2.children;
      const prevShapeFlag = n1.shapeFlag;
      const nextShapeFlag = n2.shapeFlag;
      if (nextShapeFlag & 8 /* TEXT_CHILDREN */) {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          unmountChildren(c1);
        }
        if (c1 !== c2) {
          hostSetElementText(el, c2);
        }
      } else {
        if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
          if (nextShapeFlag & 16 /* ARRAY_CHILDREN */) {
            patchKeyedChildren(c1, c2, el);
          } else {
            unmountChildren(c1);
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
    const patchKeyedChildren = (c1, c2, el) => {
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
    const unmountChildren = (children) => {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i]);
      }
    };
    const processFragment = (n1, n2, container) => {
      if (n1 == null) {
        mountChildren(n2.children, container);
      } else {
        patchChildren(n1, n2, container);
      }
    };
    const processComponent = (n1, n2, container, anchor) => {
      if (n1 == null) {
        mountComponent(n2, container, anchor);
      } else {
        updateComponent(n1, n2);
      }
    };
    const updateComponent = (n1, n2) => {
      const instance = n2.component = n1.component;
      const { props: prevProps } = n1;
      const { props: nextProps } = n2;
      updateProps(instance, prevProps, nextProps);
    };
    const patch = (n1, n2, container, anchor = void 0) => {
      if (n1 === n2)
        return;
      if (n1 && !isSameVnode(n1, n2)) {
        unmount(n1);
        n1 = null;
      }
      const { type, shapeFlag } = n2;
      switch (type) {
        case Text:
          processText(n1, n2, container);
          break;
        case Fragment:
          processFragment(n1, n2, container);
          break;
        default:
          if (shapeFlag & 1 /* ELEMENT */)
            processElement(n1, n2, container, anchor);
          else if (shapeFlag & 6 /* COMPONENT */) {
            processComponent(n1, n2, container, anchor);
          }
      }
    };
    const mountComponent = (vnode, container, anchor) => {
      const instance = vnode.component = createComponentInstance(vnode);
      setupComponent(instance);
      setupRenderEffect(instance, container, anchor);
    };
    const setupRenderEffect = (instance, container, anchor) => {
      const { proxy, render: render3 } = instance;
      const componentUpdate = () => {
        if (!instance.isMounted) {
          const subTree = instance.subTree = render3.call(proxy);
          patch(null, subTree, container, anchor);
          instance.isMounted = true;
        } else {
          const subTree = render3.call(proxy);
          patch(instance.subTree, subTree, container, anchor);
          instance.subTree = subTree;
        }
      };
      const effect = new ReactiveEffect(componentUpdate, () => queueJob(instance.update));
      const update = instance.update = effect.run.bind(effect);
      update();
    };
    const mountElement = (vnode, container, anchor = void 0) => {
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
        mountChildren(children, el);
      }
      hostInsert(el, container, anchor);
    };
    const mountChildren = (children, el) => {
      for (let i = 0; i < children.length; i++) {
        const child = normalize(children, i);
        patch(null, child, el);
      }
    };
    const normalize = (children, index) => {
      if (isString(children[index]))
        return children[index] = createVnode(Text, null, children[index]);
      return children[index];
    };
    const unmount = (vnode) => {
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

  // packages/runtime-dom/src/index.ts
  var renderOptions = Object.assign({}, nodeOps, { patchProp });
  var render = (vnode, container) => {
    createRenderer(renderOptions).render(vnode, container);
  };
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=runtime-dom.global.js.map
