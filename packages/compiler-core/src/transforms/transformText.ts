import { PatchFlags } from "@vue/shared";
import { ITransformContext } from "./type";
import { parse, INode, INodeElement } from "../parse";
import { createCallExpression, NodeTypes } from "../ast";
/**
 * 期待将多个子节点拼在一起
 * @param node
 * @param context
 */
export const transformText = (
  node: ReturnType<typeof parse>,
  context: ITransformContext
) => {
  // 你是不是文本 遇到需要元素的时候 才能处理多个子节点
  if (node.type === NodeTypes.ELEMENT || node.type === NodeTypes.ROOT) {
    return () => {
      // 5 是表达式 2是文本 转为复合表达式 最后只需创建一个节点
      // 需要查找连续的 5 2 然后拼接在一起
      let currentContainer = null;
      const children = node.children;
      let hasText = false;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        hasText = true;
        // 判断当前孩子节点是不是文本节点
        if (isText(child)) {
          // 判断下一个节点是不是文本
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j];
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = (children[i] as any) = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child],
                };
              }
              currentContainer.children.push("+", next);
              // 删除拼接的节点
              children.splice(j--, 1);
            } else {
              currentContainer = null;
              break;
            }
          }
        }
      }
      if (!hasText || children.length === 1) {
        // 长度是1 而且是文本
        return;
      }
      // 需要给多个儿子中的创建文本节点添加patchFlag
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const callArgs = [];
        if (isText(child) || child.type === NodeTypes.COMPOUND_EXPRESSION) {
          // 都是文本
          callArgs.push(child);
          // 动态节点
          if (node.type !== NodeTypes.TEXT) {
            // 靶向更新
            callArgs.push(PatchFlags.TEXT);
          }
          // 添加一个createTextVnode这个方法
          (children[i] as any) = {
            // 通过createTextVnode来实现
            type: NodeTypes.TEXT_CALL,
            content: child as INode,
            codegenNode: createCallExpression(context, callArgs),
          };
        }
      }
    };
  }
};

export const isText = (node: INode | INodeElement): node is INode => {
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
};
