import { NodeTypes } from "./ast";

export const compile = (template: string) => {
  // 将模板转成抽象语法树
  const ast = parse(template);
  return ast;
  // 对ast进行一些预先处理 会进行一些预先处理
  // transform(ast); // 生成一些辅助信息
  // return generate(ast); // 代码生成
};

export const parse = (template: string) => {
  // 创建一个解析上下文 进行处理
  const context = createParserContext(template);
  const nodes = []; // 存放解析结果
  // 1. < 元素 2. {{}}表达式 3. 正常文本
  while (!isEnd(context)) {
    const source = context.source;
    let node;
    if (source.startsWith("{{")) {
    } else if (source[0] === "<") {
    }
    // 文本
    if (!node) {
      node = parseText(context);
      debugger;
      break;
    }
    nodes.push(node);
  }
  return template;
};
/**
 * 创建解析上下文
 * @param template
 * @returns
 */
export const createParserContext = (template: string) => {
  return {
    line: 1,
    column: 1,
    offset: 0, // 偏移字符
    source: template, // 此字段会被不停解析 slice截取
    originalSource: template,
  };
};
/**
 * 解析文本
 * @param context
 */
const parseText = (context: ContextType) => {
  // 解析文本的时候 看后面到哪里结束
  const endTokens = ["<", "{{"];
  // 默认到最后结束
  let endIndex = context.source.length;
  for (let i = 0; i < endTokens.length; i++) {
    let index = context.source.indexOf(endTokens[i], 1);
    // 找到了 并且第一次比整个字符串小
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  // 创建行列信息 方便报错
  const start = getCursor(context); // 开始
  // 取内容
  const content = parseTextData(context, endIndex);
  // 获取结束位置

  return {
    type: NodeTypes.TEXT,
    content,
    // 位置信息
    loc: getSelection(context, start),
  };
};
/**
 * 获取选中的字符串
 * @param context
 * @param start
 * @param end
 * @returns
 */
const getSelection = (
  context: ContextType,
  start: {
    line: number;
    column: number;
    offset: number;
  },
  end = getCursor(context)
) => ({
  start,
  end,
  source: context.originalSource.slice(start.offset, end.offset),
});

const parseTextData = (context: ContextType, endIndex: number) => {
  // 截取到的内容
  const rawText = context.source.slice(0, endIndex);
  // 、将内容部分从source里面删除掉
  advanceBy(context, endIndex);
  return rawText;
};
/**
 * 删除截取的字符串 也需要更新最新的行列信息
 * @param context
 * @param endIndex
 */
const advanceBy = (context: ContextType, endIndex: number) => {
  const source = context.source;
  advancePositionWithMutation(context, source, endIndex);
  // 删除截取的字符串
  context.source = context.source.slice(endIndex);
};
const advancePositionWithMutation = (
  context: ContextType,
  source: string,
  endIndex: number
) => {
  let linesCount = 0;
  let linePos = -1;
  for (let i = 0; i < endIndex; i++) {
    // 换行 \n
    if (source.charCodeAt(i) === 10) {
      linesCount++;
      linePos = i;
    }
  }
  debugger;
  context.line += linesCount;
  context.column =
    linePos === -1
      ? // 没有换行
        context.column + endIndex
      : endIndex - linePos;
  context.offset += endIndex;
};
/**
 * 返回行列偏移量 位置信息
 * @param context
 * @returns
 */
const getCursor = (context: ContextType) => {
  const { line, column, offset } = context;
  return { line, column, offset };
};

type ContextType = ReturnType<typeof createParserContext>;

const isEnd = (context: ContextType) => {
  const source = context.source;
  return !source; //是否解析结束
};
