import { ShapeFlags } from "@vue/shared";

export const initSlots = (instance, children) => {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    // 是否是插槽 如果是插槽 我们传入给组件的孩子是一个对象
    instance.slots = children; // 保留children
  }
};
