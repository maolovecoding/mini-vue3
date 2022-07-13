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
  const nodes: INode[] = []; // 存放解析结果
  // 1. < 元素 2. {{}}表达式 3. 正常文本
  while (!isEnd(context)) {
    const source = context.source;
    let node: INode;
    if (source.startsWith("{{")) {
      debugger;
      node = parseInterpolation(context);
    } else if (source[0] === "<") {
    }
    // 文本
    if (!node) {
      node = parseText(context);
      debugger;
    }
    nodes.push(node);
  }
  return template;
};
/**
 * 解析表达式
 * @param context
 */
const parseInterpolation = (context: ContextType) => {
  // 起始位置
  const start = getCursor(context);
  // 内容的结束位置
  const closeIndex = context.source.indexOf("}}",2);
  // 删除 {{
  advanceBy(context, 2);
  // 内容的起始和结束位置 在后面会更新
  const innerStart = getCursor(context);
  const innerEnd = getCursor(context);
  // 表达式的长度
  const rawContentLength = closeIndex - 2;
  // 拿到表达式
  const preContent = parseTextData(context, rawContentLength);
  // 去除开头结尾的空格
  const content = preContent.trim();
  // {{  name}} 实际变量的位置
  const startOffset = preContent.indexOf(content);
  // 更新表达式实际变量的开始和结束位置
  if (startOffset > 0) {
    advancePositionWithMutation(innerStart, preContent, startOffset);
  }
  const endOffset = startOffset + content.length;
  advancePositionWithMutation(innerEnd, preContent, endOffset);
  // 删除 }}
  advanceBy(context, 2);
  return {
    type: NodeTypes.INTERPOLATION, // 表达式
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      loc: getSelection(context, innerStart, innerEnd),
    },
    loc: getSelection(context, start),
  } as INode;
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
  return {
    type: NodeTypes.TEXT,
    content,
    // 位置信息
    loc: getSelection(context, start),
  } as INode;
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
  start: ILocationMessage,
  end = getCursor(context)
) =>
  ({
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset),
  } as ILocation);
/**
 * 解析文本内容并返回
 * @param context
 * @param endIndex
 * @returns
 */
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
  context: ILocationMessage,
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
  return { line, column, offset } as ILocationMessage;
};

const isEnd = (context: ContextType) => {
  const source = context.source;
  return !source; //是否解析结束
};
type ContextType = ReturnType<typeof createParserContext>;

interface INode {
  type: NodeTypes;
  content: string | INode;
  loc: ILocation;
}
interface ILocation {
  start: ILocationMessage;
  end: ILocationMessage;
  source: string;
}
interface ILocationMessage {
  line: number;
  column: number;
  offset: number;
}
