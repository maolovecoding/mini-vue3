import { currentInstance } from "./component";
export const provide = (key: symbol | string, value: any) => {
  if (!currentInstance) {
    // 不在setup中使用 报错
    throw new TypeError("需要在 setup 函数中使用 provide 函数");
  }
  const parentProvides = currentInstance.parent?.provides;
  let provides = currentInstance.provides; // 自己的provides
  // 自己的provides目前还是和父组件同一份的provides 所以我们需要拷贝一份
  // 不能说自己新记录自己组件提供的数据 让父组件也同时看得见
  if (parentProvides === provides) {
    // 初始化阶段 是同一个 需要重新创建
    provides = currentInstance.provides = Object.create(provides);
  }
  provides[key] = value;
};
export const inject = (key: symbol | string, defaultValue) => {
  if (!currentInstance) {
    // 不在setup中使用 报错
    throw new TypeError("需要在 setup 函数中使用 inject 函数");
  }
  const provides = currentInstance.parent?.provides;
  if (provides && key in provides) {
    // 取出父级组件提供的key
    return provides[key];
  }
  return defaultValue;
};
