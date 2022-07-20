import { INodeElement } from "./../parse";
import { ITransformContext } from "./type";
import { parse } from "../parse";
import { NodeTypes, createVnodeCall, createObjectExpression } from "../ast";
/**
 * 将所有儿子处理完以后 给元素重新添加children属性
 * @param node
 * @param context
 */
export const transformElement = (
  node: ReturnType<typeof parse>,
  context: ITransformContext
) => {
  // 判断是不是元素
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // createElementVnode("div", {}, [])
      const vnodeTag = `"${(node as INodeElement).tag}"`;
      const properties = [];
      const props = (node as INodeElement).props;
      for (let i = 0; i < props.length; i++) {
        properties.push({
          key: props[i].name,
          value: props[i].value.content,
        });
      }
      // 创建一个属性表达式
      const propsExpression =
        properties.length > 0 ? createObjectExpression(properties) : null;
      let childrenNode = null;
      // 需要考虑孩子的情况 直接是一个节点的情况
      if (node.children.length === 1) {
        childrenNode = node.children[0];
      } else if (node.children.length > 1) {
        childrenNode = node.children;
      }
      (node as any).codegenNode = createVnodeCall(
        context,
        vnodeTag,
        propsExpression,
        childrenNode
      );
    };
  }
};
