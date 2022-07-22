import { isFunction } from "@vue/shared";
import { Fragment } from "./vnode";
import { h } from "./h";
import { ref } from "@vue/reactivity";
/**
 * 异步加载组件
 * @param loader
 */
export const defineAsyncComponent = (
  options: ILoader | (() => Promise<any>)
) => {
  if (isFunction(options)) {
    options = { loader: options };
  }
  return {
    setup() {
      // 是否加载完毕
      const loaded = ref(false);
      // 失败
      const error = ref(false);
      const delayLoading = ref(false);
      const {
        loader,
        timeout = Infinity,
        delay = 200,
        loadingComponent,
        errorComponent,
        onError,
      } = options as ILoader;
      setTimeout(() => {
        if (!loaded.value) {
          error.value = true;
        }
      }, timeout);
      setTimeout(() => {
        if (!loaded.value) {
          delayLoading.value = true;
        }
      }, delay);
      let Cmp;
      const load = () => {
        return loader().catch((err) => {
          if (onError) {
            return new Promise((resolve, reject) => {
              const retry = () => resolve(load());
              const fail = () => reject(err);
              onError(err, retry, fail);
            });
          }
        });
      };
      load()
        .then((cmp) => {
          // promise 加载完毕 也就是请求到了组件 将组件给Cmp 并且重新渲染一下组件
          // if (!error.value) {
          Cmp = cmp;
          loaded.value = true;
          // }
        })
        .catch()
        .finally(() => (delayLoading.value = false));
      return () => {
        if (loaded.value && Cmp) return h(Cmp);
        if (error.value && errorComponent) return h(errorComponent);
        if (delayLoading.value && loadingComponent) return h(loadingComponent);
        return h(Fragment, []);
      };
    },
  };
};

interface ILoader {
  loader: () => Promise<any>;
  delay?: number;
  timeout?: number;
  loadingComponent?;
  errorComponent?;
  onError?: (err, retry, fail) => void;
}
