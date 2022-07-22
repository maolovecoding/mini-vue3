import { reactive } from "@vue/reactivity";
import { hasOwn, isArray, ShapeFlags } from "@vue/shared";
/*
 * @Author: 毛毛
 * @Date: 2022-06-29 14:50:26
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-29 15:19:51
 */
/**
 *
 * @param instance 组件实例
 * @param rawProps 渲染组件时 传递的属性
 */
export const initProps = (instance, rawProps) => {
  const props = {};
  const attrs = {};
  let options = instance.propsOptions || {};
  // 是数组定义的props 还是对象形式 对象形式可以进行参数的校验
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
      // TODO 参数校验
      if (options[key] !== null) {
        if (
          // name:{type:String}
          (options[key].type &&
            !(Object(value) instanceof options[key].type)) ||
          // name:String
          !(Object(value) instanceof options[key])
        ) {
          console.warn(`${key} 不符合类型约束要求`);
        }
      }
      props[key] = value;
    } else {
      // 没有该属性 就是组件的attrs属性
      attrs[key] = value;
    }
  }
  // TODO props是浅层响应式的 这里应该属性 shadowReactive
  instance.props = reactive(props);
  instance.attrs = attrs; // 开发环境attrs是浅层响应式 生产环境 就是一个普通对象
  // TODO props是组件中的 如果是函数式组件 应该用attrs作为props
  if (instance.vnode.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT) {
    instance.props = attrs;
  }
};
