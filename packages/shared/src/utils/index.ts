/*
 * @Author: 毛毛
 * @Date: 2022-06-26 12:56:35
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-06-26 13:03:36
 */

class LazyMan {
  private name: string;
  private tasks: (() => any)[];
  constructor(name: string) {
    this.name = name;
    setTimeout(() => {
      this.next();
    });
  }
  eat(food: string) {
    const task = () => {
      console.log(`${this.name} eat ${food}`);
      this.next();
    };
    this.tasks.push(task);
    return this;
  }
  private next() {
    const task = this.tasks.shift();
    if (task) task();
  }
  sleep(seconds: number) {
    const task = () => {
      // 延迟执行下一个任务
      setTimeout(() => this.next(), seconds * 1000);
    };
    this.tasks.push(task);
    return this;
  }
}
