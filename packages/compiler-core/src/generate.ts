import { helperMap, TO_DISPLAY_STRING } from "./runtimeHelpers";
import { parse } from "./parse";
import { NodeTypes } from "./ast";

export const generate = (ast: ReturnType<typeof parse>) => {
  const context = createCodegenContext(ast);
  // 生成函数 以及参数
  const { push, indent, deIntent } = context;
  getFunctionPreable(ast, context);
  const functionName = "render";
  const args = ["_ctx", "_cache", "$props"];
  push(`function ${functionName}(${args.join(", ")}) {`);
  indent();
  push("return ");
  console.log(ast);
  if ((ast as any).codegenNode) {
    genNode((ast as any).codegenNode, context);
  } else {
    push("null");
  }
  deIntent();
  push("}");
  console.log(context.code);
};
const genText = (node, context) => {
  context.push(JSON.stringify(node.content));
};
const genInterpolation = (node, context) => {
  context.push(`${helperMap[TO_DISPLAY_STRING]}(`);
  debugger;
  genNode(node.content, context);
  context.push(")");
};
const genExpression = (node, context) => {
  debugger;
  context.push(node.content);
};
const genNode = (node, context) => {
  debugger;
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    // 元素 元素对象 元素的儿子 递归
  }
};
const getFunctionPreable = (
  ast: ReturnType<typeof parse>,
  context: ReturnType<typeof createCodegenContext>
) => {
  if ((ast as any).helpers.length > 0) {
    // 导入
    context.push(
      `import {${(ast as any).helpers
        .map((h) => ` ${context.helper(h)} as  _${context.helper(h)}`)
        .join(",")} } from "vue";`
    );
    // 换行
    context.newline();
  }
  context.push("export ");
};
const createCodegenContext = (ast: ReturnType<typeof parse>) => {
  const newline = (n: number) => {
    context.push("\n" + "  ".repeat(n));
  };
  const context = {
    // 生成的代码
    code: "",
    // 多少次缩进 2 * level
    indentLevel: 0,
    push(code) {
      return (context.code += code);
    },
    helper(name) {
      return `${helperMap[name]}`;
    },
    // 向后缩进
    indent() {
      ++context.indentLevel;
      context.newline();
    },
    // 向前缩进
    deIntent(withoutNewline = false) {
      --context.indentLevel;
      if (withoutNewline) {
        // 需要换行
        // --context.indentLevel;
      } else {
        // --context.indentLevel;
        context.newline();
      }
    },
    newline() {
      newline(context.indentLevel);
    },
  };
  return context;
};
