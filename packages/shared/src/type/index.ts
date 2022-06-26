/*
 * @Author: 毛毛
 * @Date: 2022-06-26 11:12:08
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 11:16:41
 */
export const getType = (val: unknown): string => {
  let type = typeof val;
  // 基本类型
  if (val != null && type !== "object") return type;
  // 对象
  type = Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
  return type;
};
