export const patchEvent = (
  el: HTMLElement,
  eventName: string,
  callback: Function
) => {
  // 自定义事件 + 内部调用用户传入的函数
  let invokers = (el as any)._vei || ((el as any)._vei = {});
  const exits = invokers[eventName];
  if (exits && callback) {
    // 绑定的事件存在
    // 直接把事件的value换成最新的即可
    exits.value.add(callback);
  } else {
    const name = eventName.slice(2).toLowerCase(); // 去除on以后的事件名称
    // 不存在
    if (callback) {
      const invoker = (invokers[eventName] = createInvoker(callback));
      el.addEventListener(name, invoker);
    } else if (exits) {
      // 事件绑定函数为null 解绑
      el.removeEventListener(name, exits);
      delete invokers[eventName];
    }
  }
};

const createInvoker = (callback: Function) => {
  const invoker = (e: Event) => {
    invoker.value.forEach((fn) => fn(e));
  };
  // 方便事件解绑
  invoker.value = new Set<Function>().add(callback);
  return invoker;
};
