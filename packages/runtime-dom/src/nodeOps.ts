/**
 * 插入节点
 * @param child
 * @param parent
 * @param anchor
 */
const insert = (child: Node, parent: Node, anchor: null | Node = null) => {
  parent.insertBefore(child, anchor);
};

const remove = (child: Node) => {
  child.parentNode?.removeChild(child);
};
/**
 * 设置元素节点的内容
 * @param el
 * @param text
 */
const setElementText = (el: Node, text: string) => {
  el.textContent = text;
};
/**
 * 设置文本节点的内容
 * @param node
 * @param text
 */
const setText = (node: Node, text: string) => {
  node.nodeValue = text;
};

const querySelector = (selector: string) => {
  return document.querySelector(selector);
};

const querySelectorAll = (selector: string) => {
  return document.querySelectorAll(selector);
};

const parentNode = (node: Node) => {
  return node.parentNode;
};
const nextSibling = (node: Node) => {
  return node.nextSibling;
};
const createElement = (tagName: string) => {
  return document.createElement(tagName);
};
const createText = (text: string) => {
  return document.createTextNode(text);
};
const createComment = (text: string) => {
  return document.createComment(text);
};
export const nodeOps = {
  insert,
  remove,
  setElementText,
  setText,
  querySelector,
  querySelectorAll,
  parentNode,
  nextSibling,
  createElement,
  createText,
  createComment,
};
