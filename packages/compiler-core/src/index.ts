import { createVnodeCall, NodeTypes } from "./ast";
import { generate } from "./generate";
import { parse } from "./parse";
import {
  CREATE_ELEMENT_BLOCK,
  CREATE_ELEMENT_VNODE,
  FRAGMENT,
  OPEN_BLOCK,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";
import {
  transformElement,
  transformExpression,
  transformText,
  ITransformContext,
} from "./transforms";

export const compile = (template: string) => {
  // 将模板转成抽象语法树
  const ast = parse(template);

  // 在生成代码之前 需要做一些转化 转化 要进行收集所需的方法 createElementVnode toDisplayString
  // 为了生成代码更方便 在转换过程中会生成这样一个属性 codegen
  // 对ast进行一些预先处理 会进行一些预先处理
  transform(ast); // 生成一些辅助信息
  return generate(ast); // 代码生成
};
/**
 * 转换
 * @param ast
 */
const transform = (ast: ReturnType<typeof parse>) => {
  const context = createTransformContext(ast);
  traverse(ast, context);
  createRootCodegen(ast, context);
  (ast as any).helpers = [...context.helpers.keys()]
  // 代码生成
};
const createRootCodegen = (
  ast: ReturnType<typeof parse>,
  context: ITransformContext
) => {
  const { children } = ast;
  if (children.length === 1) {
    const child = children[0];
    // 如果是元素 也可能是文本
    if (child.type === NodeTypes.ELEMENT && (child as any).codegenNode) {
      // /不调用 createElementVnode
      (ast as any).codegenNode = (child as any).codegenNode;
      debugger
      // 调用的是 openBlock createElementBlock
      context.removeHelper(CREATE_ELEMENT_VNODE);
      context.helper(OPEN_BLOCK);
      context.helper(CREATE_ELEMENT_BLOCK);
      // 只有一个元素 那么当前元素是一个block节点 并且使用的是 createElementBlock
      (ast as any).codegenNode.isBlock = true;
    } else {
      (ast as any).codegenNode = child 
    }
  } else {
    if(children.length === 0) return
    (ast as any).codegenNode = createVnodeCall(
      context,
      context.helper(FRAGMENT),
      null,
      children
    );
    context.helper(OPEN_BLOCK)
    context.helper(CREATE_ELEMENT_BLOCK)
    (ast as any).codegenNode.isBlock = true;
  }
};
const traverse = (
  node: ReturnType<typeof parse>,
  context: ReturnType<typeof createTransformContext>
) => {
  context.currentNode = node;
  const exitsFns = [];
  const transforms = context.nodeTransforms;
  for (let i = 0; i < transforms.length; i++) {
    // 退出函数
    const onExit = transforms[i](node, context);
    onExit && exitsFns.push(onExit);
    // 当前节点被删除了 不考虑子节点了
    if (!context.currentNode) return;
  }
  switch (node.type) {
    // /插值表达式
    case NodeTypes.INTERPOLATION:
      // 方法
      context.helper(TO_DISPLAY_STRING);
      break;
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node;
        traverse(node.children[i] as any, context);
      }
  }
  // 保证退出函数执行前 依旧是指向当前的node
  context.currentNode = node;
  let i = exitsFns.length;
  while (i--) {
    exitsFns[i]();
  }
};
/**
 * 创建转换上下文
 */
const createTransformContext = (root: ReturnType<typeof parse>) => {
  const context: ITransformContext = {
    // 当前真正转换的节点
    currentNode: root,
    // 当前转换节点的父节点
    parent: null,
    // 优化 超过20个相同的节点会被字符串化
    helpers: new Map(),
    // 根据使用过的方法进行优化
    helper(name) {
      const count = context.helpers.get(name) || 0;
      context.helpers.set(name, count + 1);
      return name;
    },
    removeHelper(name) {
      const count = context.helpers.get(name) || 0;
      if (count) {
        const currentCount = count - 1;
        if (!currentCount) {
          context.helpers.delete(currentCount);
        } else {
          context.helpers.set(name, currentCount);
        }
      }
    },
    // 转换 元素 -> 文本 -> 表达式
    nodeTransforms: [transformElement, transformText, transformExpression],
  };
  return context;
};
