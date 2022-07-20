import { ITransformContext } from "./type";
import { INode } from "../parse";
import { NodeTypes } from "../ast";
/**
 * 处理表达式
 * @param node
 * @param context
 */
export const transformExpression = (
  node: INode,
  context: ITransformContext
) => {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = `_ctx.${(node.content as INode).content}`;
  }
};
