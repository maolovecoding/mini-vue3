import { isFunction, hasOwn, isObject, ShapeFlags } from "@vue/shared";
import { proxyRefs, reactive } from "@vue/reactivity";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";

// 获取实例
export let currentInstance = null;
export const setCurrentInstance = (instance) => {
  currentInstance = instance;
};
export const getCurrentInstance = () => currentInstance;

export const createComponentInstance = (vnode, parent) => {
  // pinia 也是把数据直接通过reactive变成响应式的
  // 组件实例
  const instance = {
    ctx: {} as any, // 实例上下文对象 keep-alive中使用
    parent, // 记住父组件
    provides: parent ? parent.provides : Object.create(null), // 引用一份父组件的 provide到自身
    data: null, // 组件自身的状态数据
    vnode, // 组件自身的虚拟节点
    subTree: null, // 组件的渲染内容 vdom
    isMounted: false, // 组件是否挂载到页面上了
    update: null, // 组件的强制渲染
    propsOptions: vnode.type.props, // 定义的props属性 可能是数组或者对象 只是定义
    props: {}, // 这里记录真实传入给组件实例的 props属性和值
    attrs: {}, // 非props的其他属性保存在这里
    proxy: null, // 代理对象
    render: null, // 渲染函数
    next: null, // 产生的组件渲染的虚拟DOM 每次确定需要更新前会清空
    setupState: null, // setup函数返回值
    slots: null, // 组件插槽
  };
  return instance;
};

export const setupComponent = (
  instance: ReturnType<typeof createComponentInstance>
) => {
  const { props, type, children } = instance.vnode;
  // 初始化 组件实例的props
  initProps(instance, props);
  // 初始化插槽
  initSlots(instance, children);
  // 创建组件实例的代理对象
  instance.proxy = new Proxy(instance, publicInstanceProxyHandler);
  const data = type.data;
  if (data) {
    if (!isFunction(data)) {
      return console.warn(`data is must be a function`);
    }
    instance.data = reactive(data.call(instance.proxy));
  }
  // 拿到setup函数
  const setup = type.setup;
  if (setup) {
    // setup函数的上下文参数
    const setupContext = {
      emit(event, ...args) {
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
        // 找到属性上的方法
        const handler = instance.vnode.props[eventName];
        // 执行触发的函数
        handler && handler(...args);
      },
      attrs: instance.attrs,
      slots: instance.slots,
    };
    // 设置组件实例到全局
    setCurrentInstance(instance);
    // 执行setup函数
    const setupResult = setup(instance.props, setupContext);
    setCurrentInstance(null);
    // 返回值是函数 就作为render函数了
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else if (isObject(setupResult)) {
      // 是对象 就是作为render函数会用到的属性
      instance.setupState = proxyRefs<any>(setupResult as any); // 取消 ref的.value
    }
  }
  if (!isFunction(instance.render)) instance.render = type.render;
};

const publicInstanceProxyHandler = {
  get(target, key, receiver) {
    const { data, props, setupState } = target;
    // 在setup返回值上找
    if (setupState && hasOwn(setupState, key))
      return Reflect.get(setupState, key);
    // 在data上找访问的属性
    if (data && hasOwn(data, key)) return Reflect.get(data, key);
    // 去props找
    if (props && hasOwn(props, key)) return Reflect.get(props, key);
    // attrs
    const getter = publicPropertyMap[key];
    if (getter) return getter(target);
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
      console.warn(`不允许修改 props ${String(key)} 的值`);
      return false;
    }
  },
};

const publicPropertyMap = {
  $attrs: (i) => i.attrs,
  $slots: (i) => i.slots,
};

export const updateProps = (prevProps, nextProps) => {
  for (const key in nextProps) {
    // 属性是响应式的 修改属性会触发组件的更新 重新render
    prevProps[key] = nextProps[key];
  }
  for (const key in prevProps) {
    if (!hasOwn(nextProps, key)) {
      delete prevProps[key];
    }
  }
};
/**
 *   判断属性是否有变化
  // 1. 属性的个数 2. 值是否变化
 * @param prevProps 
 * @param nextProps 
 * @returns 
 */
export const hasPropsChanged = (prevProps = {}, nextProps = {}) => {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (const key of nextKeys) {
    if (nextProps[key] !== prevProps[key]) return true;
  }
  return false;
};

export const renderComponent = (instance) => {
  const { vnode, render, proxy, props } = instance;
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 有状态组件
    return render.call(proxy, proxy);
  }
  // 函数组件
  return vnode.type(props);
};
