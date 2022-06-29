const queue = []; // 任务队列
let isFlushing = false; // 是否正在刷新队列
const resolvePromise = Promise.resolve();
export const queueJob = (job) => {
  if (!queue.includes(job)) queue.push(job);
  // 还没有开始刷新队列 此时开一个异步任务 后续任务再此次异步队列刷新结束之前 不再开异步任务
  if (!isFlushing) {
    // 合并任务
    isFlushing = true;
    resolvePromise.then(() => {
      isFlushing = false;
      const jobs = [...queue];
      queue.length = 0; // 清空任务栈
      jobs.forEach((j) => j());
    });
  }
};
