export const enum ShapeFlags { // vue3提供的形状标识
  ELEMENT = 1, //1  元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 2 函数组件
  STATEFUL_COMPONENT = 1 << 2, // 4 有状态组件
  TEXT_CHILDREN = 1 << 3, // 8 文本孩子
  ARRAY_CHILDREN = 1 << 4, // 16 数组孩子
  SLOTS_CHILDREN = 1 << 5, // 32 插槽孩子
  TELEPORT = 1 << 6, // 64 teleport组件
  SUSPENSE = 1 << 7, // 128  suspense 组件
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 256
  COMPONENT_KEPT_ALIVE = 1 << 9, //512
  // 组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 6 -> 4 | 2 -> 0100  0010 -> 0110
}
