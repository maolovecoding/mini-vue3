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
    createRenderer: () => createRenderer,
    createVnode: () => createVnode,
    h: () => h,
    isVnode: () => isVnode,
    render: () => render
  });

  // packages/runtime-dom/src/nodeOps.ts
  var insert = (child, parent, anchor = null) => {
    parent.insertBefore(child, anchor);
  };
  var remove = (child) => {
    var _a;
    (_a = child.parentNode) == null ? void 0 : _a.removeChild(child);
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
  var isString = (val) => {
    return typeof val === "string";
  };
  var isArray = Array.isArray;

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
    const patch = (n1, n2, container) => {
      if (n1 === n2)
        return;
      if (n1 == null) {
        mountElement(n2, container);
      } else {
      }
    };
    const mountElement = (vnode, container) => {
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
      hostInsert(el, container);
    };
    const mountChildren = (children, el) => {
      console.log(children, el);
      for (let i = 0; i < children.length; i++) {
        patch(null, children[i], el);
      }
    };
    const render2 = (vnode, container) => {
      if (vnode == null) {
      } else {
        patch(container._vnode || null, vnode, container);
      }
      container._vnode = vnode;
    };
    return {
      render: render2
    };
  };

  // packages/runtime-core/src/vnode.ts
  var createVnode = (type, props, children = null) => {
    const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
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
