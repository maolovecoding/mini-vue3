/*
 * @Author: 毛毛
 * @Date: 2022-06-29 08:55:55
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-29 10:01:02
 */
// 最长递增子序列
// 贪心 + 二分查找
//  3 2 8 9 6 7 11 15

/**
 * 1. 当前想比我们已经收集的序列的最后一项大 直接放到末尾
 * 2. 如果当前这一项比最后一项小，需要在序列中通过二分查找找到比当前这一项大的，然后替换
 * @param {Array<number>} arr
 * @description 此时 只是最长递增子序列的个数正确 位置并不对
 */
function getSequence1(arr) {
  // 保存的是最长递增子序列的索引
  const res = [0];
  const len = arr.length;
  let resLastIndex;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    // vue中 0意味着每天patch，也就是不能复用老节点 需要创建新节点
    if (arrI !== 0) {
      resLastIndex = res[res.length - 1];
      // 找到索引对应的值 和当前项进行比较
      if (arr[resLastIndex] < arrI) {
        res.push(i);
        continue;
      }
      // 序列中不会出现重复元素 来到这里就需要二分查找 替换比当前项大的索引了
      let start = 0,
        end = res.length - 1,
        middle;
      while (start < end) {
        middle = (start + end) >> 1;
        if (arr[res[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      // 此时 start = end 也就是中间值 进行替换当前值的索引
      if (arr[res[start]] > arrI) {
        res[start] = i;
      }
    }
  }
  return res;
}

/**
 * 标记索引的方式 从最后一项往前找 还原正确的索引
 * @param {*} arr
 * @returns
 */
function getSequence(arr) {
  // 保存的是最长递增子序列的索引
  const res = [0];
  const len = arr.length;
  const p = arr.slice(0); // 标记索引 最后用来找到正确的索引
  let resLastIndex;
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    // vue中 0意味着每天patch，也就是不能复用老节点 需要创建新节点
    if (arrI !== 0) {
      resLastIndex = res[res.length - 1];
      // 找到索引对应的值 和当前项进行比较
      if (arr[resLastIndex] < arrI) {
        res.push(i);
        p[i] = resLastIndex; // 当前放到末尾的 要记住它前面那个元素的索引
        continue;
      }
      // 序列中不会出现重复元素 来到这里就需要二分查找 替换比当前项大的索引了
      let start = 0,
        end = res.length - 1,
        middle;
      while (start < end) {
        middle = (start + end) >> 1;
        if (arr[res[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      // 此时 start = end 也就是中间值 进行替换当前值的索引
      if (arr[res[start]] > arrI) {
        res[start] = i;
        p[i] = res[start - 1]; // 记住前一项 res[start]是被替换的，需要记住的是这一项的前一项
      }
    }
  }
  // 通过最后一项 开始回溯  找到正确的序列
  let i= res.length,last = res[i-1]
  while(i--){
    // 倒叙追溯
    res[i] = last; // last 也是索引
    last = p[last]// 上一项的索引
  }
  return res;
}

console.log(getSequence([3, 2, 8, 9, 5, 6, 7, 11, 15, 4]));
