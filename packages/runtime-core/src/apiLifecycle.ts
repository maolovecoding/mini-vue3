import { getCurrentInstance, setCurrentInstance } from "./component";

export const enum LifeCycle {
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BEFORE_UPDATE = "bu",
  UPDATED = "u",
}

export const createHook = (type: LifeCycle) => {
  return (hook: Function, target = getCurrentInstance()) => {
    if (target) {
      // 关联 instance 和当前setup里面的hook
      const hooks = target[type] || (target[type] = []);
      // 还需要记录instance 因为在hook里面可能获取组件实例
      hooks.push(() => {
        setCurrentInstance(target);
        hook();
        setCurrentInstance(null);
      });
    }
  };
};
export const onBeforeMount = createHook(LifeCycle.BEFORE_MOUNT);
export const onMounted = createHook(LifeCycle.MOUNTED);
export const onBeforeUpdate = createHook(LifeCycle.BEFORE_UPDATE);
export const onUpdated = createHook(LifeCycle.UPDATED);
