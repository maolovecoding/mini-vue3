import { isFunction, hasOwn } from "@vue/shared";
import { reactive } from "@vue/reactivity";
import { initProps } from "./componentProps";
export const createComponentInstance = (vnode) => {
  // pinia 也是把数据直接通过reactive变成响应式的
  // 组件实例
  const instance = {
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
  };
  return instance;
};

export const setupComponent = (
  instance: ReturnType<typeof createComponentInstance>
) => {
  const { props, type } = instance.vnode;
  // 初始化 组件实例的props
  initProps(instance, props);

  // 创建组件实例的代理对象
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

const publicInstanceProxyHandler = {
  get(target, key, receiver) {
    // 先在data上找访问的属性
    const { data, props } = target;
    if (data && hasOwn(data, key)) return Reflect.get(data, key);
    // 去props找
    if (props && hasOwn(props, key)) return Reflect.get(props, key);
    // attrs
    const getter = publicPropertyMap[key];
    if (getter) return getter(target);
  },
  set(target, key, value, receiver) {
    const { data, props } = target;
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
};

export const updateProps = (
  instance: ReturnType<typeof createComponentInstance>,
  prevProps,
  nextProps
) => {
  // 判断属性是否有变化
  // 1. 属性的个数 2. 值是否变化
  if (hasPropsChanged(prevProps, nextProps)) {
    for (const key in nextProps) {
      // 属性是响应式的 修改属性会触发组件的更新 重新render
      instance.props[key] = nextProps[key];
    }
    for (const key in instance.props) {
      if (!hasOwn(nextProps, key)) {
        delete instance.props[key];
      }
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
const hasPropsChanged = (prevProps = {}, nextProps = {}) => {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (const key of nextKeys) {
    if (nextProps[key] !== prevProps[key]) return true;
  }
  return false;
};
