import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";
import { createRenderer } from "@vue/runtime-core";
/**
 * 封装的DOM操作 增删改查等
 */
const renderOptions = Object.assign({}, nodeOps, { patchProp });
/**
 * 定义的渲染器 浏览器使用
 * @param vnode
 * @param container
 */
export const render = (vnode, container) => {
  createRenderer(renderOptions).render(vnode, container);
};

export * from "@vue/runtime-core";
export * from "@vue/reactivity";
