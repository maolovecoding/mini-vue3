import { onMounted, onUpdated } from "../apiLifecycle";
import { ShapeFlags } from "@vue/shared";
import { isVnode } from "../vnode";
import { getCurrentInstance } from "../component";

const KeepAliveImpl = {
  __isKeepAlive: true,
  props: [
    "include", // 要缓存的
    "exclude", // 排除那些不缓存
    "max", // 最大缓存个数
  ],
  setup(props, { slots }) {
    console.log(props);
    const keys = new Set(); // 缓存的key
    const cache = new Map(); // 那个key对应的是那个虚拟节点
    // 当前组件实例
    const instance = getCurrentInstance();
    const { createElement, move } = instance.ctx.renderer;
    const storageContainer = createElement("div"); // 稍后把要渲染好的组件移入进入
    instance.ctx.deactivate = (vnode) => {
      move(vnode, storageContainer);
      // TODO 调用 deactivate钩子
    };
    instance.ctx.activate = (vnode, container, anchor) => {
      move(vnode, container, anchor);
      // TODO 调用 activate钩子
    };
    let pendingCacheKey = null;
    const cacheSubTree = () => {
      if (pendingCacheKey !== null) {
        // 挂载完成后缓存当前实例对应的subTree
        cache.set(pendingCacheKey, instance.subTree);
      }
    };
    onMounted(cacheSubTree);
    onUpdated(cacheSubTree);
    let currentVnode = null;
    // 清除缓存的subTree
    const pruneCacheEntry = (key) => {
      cache.delete(key);
      keys.delete(key);
      // 重置shapeFlag
      resetShapeFlag(currentVnode);
    };
    // 如何操作DOM元素
    return () => {
      // keepalive默认会取出slots的default属性 返回虚拟节点的第一个
      const vnode = slots.default();
      // 查看vnode是否是组件 只缓存有状态的组件
      if (
        !isVnode(vnode) ||
        !(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
      ) {
        return vnode;
      }
      // 拿到组件
      const cmp = vnode.type;
      const key = vnode.key ?? cmp;
      // 组件的名字 可以根据组件名来决定是否需要缓存
      const name = cmp.name;
      // 组件不需要缓存的情况
      if (
        (name && props.include && !props.include.includes(name)) ||
        (props.exclude && props.exclude.includes(name))
      ) {
        return vnode;
      }
      // 看是否缓存过组件
      let cacheVnode = cache.get(key);
      if (cacheVnode) {
        vnode.component = cacheVnode; //复用component
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE; // 表示复用组件 不需要重新创建组件实例
        // LRU
        keys.delete(key);
        keys.add(key);
      } else {
        // 缓存当前组件 的标识
        keys.add(key);
        pendingCacheKey = key;
        if (props.max && keys.size > props.max) {
          // 迭代器
          pruneCacheEntry(keys.values().next().value);
        }
      }
      // 组件卸载并不是真的要卸载
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
      currentVnode = vnode;
      return vnode; // 组件 -> 组件渲染的内容
    };
  },
};
/**
 *
 * @param vnode 重置shapeFlag
 */
const resetShapeFlag = (vnode) => {
  let shapeFlag = vnode.shapeFlag;
  if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
  }
  if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
    shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE;
  }
  vnode.shapeFlag = shapeFlag;
};

export { KeepAliveImpl as KeepAlive };

export const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
