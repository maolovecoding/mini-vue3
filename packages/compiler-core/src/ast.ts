import { CREATE_ELEMENT_VNODE, CREATE_TEXT } from "./runtimeHelpers";
export const enum NodeTypes {
  ROOT, // 根节点 Fragment
  ELEMENT, // 元素
  TEXT, // 文本
  COMMENT, // 注释
  SIMPLE_EXPRESSION, // 表达式的值
  INTERPOLATION, // 插值
  ATTRIBUTE, // 属性
  DIRECTIVE, // 指令
  // containers
  COMPOUND_EXPRESSION, // 复合表达式
  IF,
  IF_BRANCH,
  FOR,
  TEXT_CALL,
  // codegen
  VNODE_CALL,
  JS_CALL_EXPRESSION,
  JS_OBJECT_EXPRESSION,
}

export const createCallExpression = (context, args) => {
  const callee = context.helper(CREATE_TEXT);
  return {
    callee,
    type: NodeTypes.JS_CALL_EXPRESSION,
    arguments: args,
  };
};

export const createObjectExpression = (properties) => {
  return {
    type: NodeTypes.JS_OBJECT_EXPRESSION,
    properties,
  };
};

export const createVnodeCall = (
  context,
  vnodeTag,
  propsExpression,
  childrenNode
) => {
  context.helper(CREATE_ELEMENT_VNODE);
  return {
    type: NodeTypes.VNODE_CALL,
    tag: vnodeTag,
    props: propsExpression,
    children: childrenNode,
  };
};
