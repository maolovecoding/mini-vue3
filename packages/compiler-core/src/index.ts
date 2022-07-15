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
  return parseChildren(context);
};
/**
 * 解析孩子
 * @param context
 * @returns
 */
const parseChildren = (context: ContextType) => {
  const nodes: (INode | INodeElement)[] = []; // 存放解析结果
  // 1. < 元素 2. {{}}表达式 3. 正常文本
  while (!isEnd(context)) {
    const source = context.source;
    let node: INode | INodeElement;
    if (source.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (source[0] === "<") {
      node = parseElement(context);
    }
    // 文本
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
};
/**
 * 解析元素
 * @param context
 */
const parseElement = (context: ContextType) => {
  // 解析标签 <div id="app"></div>
  const ele = parseTag(context);
  // 解析标签的孩子标签
  const children = parseChildren(context); // 可能没有儿子
  // 解析结束标签 </div>
  if (context.source.startsWith("</")) {
    parseTag(context);
  }
  // 计算最新的位置信息 也就是最新的结束位置
  ele.loc = getSelection(context, ele.loc.start);
  ele.children = children;
  return ele;
};
/**
 * 解析标签
 * @param context
 * @returns
 */
const parseTag = (context: ContextType) => {
  const start = getCursor(context);
  const regexp = /^<\/?([a-z][^ \t\r\n/>]*)/;
  // 匹配结果
  const match = regexp.exec(context.source);
  const tag = match[1];
  // 删除整个标签开头 <div
  advanceBy(context, match[0].length);
  // 去除标签名和属性之间的空格
  advanceBySpaces(context);
  // TODO 属性也需要删除
  const props = parseAttributes(context);
  // 是否是自闭合标签 <div xxx />
  const isSelfClosing = context.source.startsWith("/>");
  advanceBy(context, isSelfClosing ? 2 : 1);
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    isSelfClosing,
    loc: getSelection(context, start),
  } as INodeElement;
};
const parseAttributes = (context: ContextType) => {
  // a="1" b="2">
  const props: IProps[] = [];
  while (context.source.length > 0 && !context.source.startsWith(">")) {
    const prop = parseAttribute(context);
    props.push(prop);
    advanceBySpaces(context);
  }
  return props;
};
const parseAttribute = (context: ContextType) => {
  const start = getCursor(context);
  // 属性名 属性值
  const propReg = /^[^\t\r\n\f />][^\t\r\n\f />=]*/;
  const propKey = propReg.exec(context.source)[0];
  advanceBy(context, propKey.length);
  advanceBySpaces(context);
  // 删除 =
  advanceBy(context, 1);
  const propValue = parseAttributeValue(context);
  return {
    type: NodeTypes.ATTRIBUTE,
    name: propKey,
    value: {
      type: NodeTypes.TEXT,
      ...propValue,
    },
    loc: getSelection(context, start),
  } as IProps;
};
const parseAttributeValue = (context: ContextType) => {
  const start = getCursor(context);
  // a="1" b='2'
  const quote = context.source[0];
  let content: string;
  // 区分单引号 双引号
  if (quote === "'" || quote === '"') {
    advanceBy(context, 1);
    const endIndex = context.source.indexOf(quote);
    // 中间内容就是文本
    content = parseTextData(context, endIndex);
    advanceBy(context, 1);
  }
  return { content, loc: getSelection(context, start) } as IPropsValue;
};
/**
 * 解析表达式
 * @param context
 */
const parseInterpolation = (context: ContextType) => {
  // 起始位置
  const start = getCursor(context);
  // 内容的结束位置
  const closeIndex = context.source.indexOf("}}", 2);
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
/**
 * 去除空格
 * @param context
 */
const advanceBySpaces = (context: ContextType) => {
  const match = /^[ \r\t\n]+/.exec(context.source);
  if (match) {
    advanceBy(context, match[0].length);
  }
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
  // 防止解析子标签死循环
  if (source.startsWith("</")) return true;
  return !source; //是否解析结束
};
type ContextType = ReturnType<typeof createParserContext>;

interface INode {
  type: NodeTypes;
  content: string | INode;
  loc: ILocation;
}
interface INodeElement {
  type: NodeTypes;
  tag: string;
  children?: (INode | INodeElement)[];
  props?: IProps[];
  isSelfClosing: boolean;
  loc: ILocation;
}
interface IProps {
  type: NodeTypes;
  name: string; // 属性名
  value: { type: NodeTypes; content: string; loc: ILocation };
  loc: ILocation;
}
interface IPropsValue {
  content: string;
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
