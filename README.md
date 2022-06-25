# mini-vue3

##  Vue设计思想

- Vue3.0更注重模块上的拆分，在2.0中无法单独使用部分模块。需要引入完整的Vuejs(例如只想使用使用响应式部分，但是需要引入完整的Vuejs)， Vue3中的模块之间耦合度低，模块可以独立使用。 **拆分模块**
- Vue2中很多方法挂载到了实例中导致没有使用也会被打包（还有很多组件也是一样）。通过构建工具Tree-shaking机制实现按需引入，减少用户打包后体积。 **重写API**
- Vue3允许自定义渲染器，扩展能力强。不会发生以前的事情，改写Vue源码改造渲染方式。 **扩展更方便**

> 依然保留Vue2的特色

### 声明式框架

> Vue3依旧是声明式的框架，用起来简单。

**命令式和声明式区别**

- 早在JQ的时代编写的代码都是命令式的，命令式框架重要特点就是关注过程
- 声明式框架更加关注结果。命令式的代码封装到了Vuejs中，过程靠vuejs来实现

> 声明式代码更加简单，不需要关注实现，按照要求填代码就可以 （给上原材料就出结果）

```js
- 命令式编程：
let numbers = [1,2,3,4,5]
let total = 0
for(let i = 0; i < numbers.length; i++) {
  total += numbers[i] - 关注了过程
}
console.log(total)

- 声明式编程：
let total2 = numbers.reduce(function (memo,current) {
  return memo + current
},0)
console.log(total2)
```

### 采用虚拟DOM

传统更新页面，拼接一个完整的字符串innerHTML全部重新渲染，添加虚拟DOM后，可以比较新旧虚拟节点，找到变化在进行更新。虚拟DOM就是一个对象，用来描述真实DOM的

```js
const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    children,
    component: null,
    el: null,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
} 
```

### 区分编译时和运行时

- 我们需要有一个虚拟DOM，调用渲染方法将虚拟DOM渲染成真实DOM （缺点就是虚拟DOM编写麻烦）
- 专门写个编译时可以将模板编译成虚拟DOM （在构建的时候进行编译性能更高，不需要再运行的时候进行编译，而且vue3在编译中做了很多优化）



## Vue3 架构

### Monorepo 管理项目

Monorepo 是管理项目代码的一个方式，指在一个项目仓库(repo)中管理多个模块/包(package)。 Vue3源码采用 monorepo 方式进行管理，将模块拆分到package目录中。

- 一个仓库可维护多个模块，不用到处找仓库
- 方便版本管理和依赖管理，模块之间的引用，调用都非常方便

### Vue3采用Typescript

> Vue2 采用Flow来进行类型检测 （Vue2中对TS支持并不友好）， Vue3源码采用Typescript来进行重写 , 对Ts的支持更加友好。



## vue的开发环境搭建

### 搭建Monorepo环境

Vue3中使用`pnpm` `workspace`来实现`monorepo` ([pnpm](https://pnpm.io/)是快速、节省磁盘空间的包管理器。主要采用符号链接的方式管理模块)

#### 全局安装pnpm

```shell
npm i pnpm -g
```

#### 创建.npmrc文件

```js
shamefully-hoist = true
```

这里您可以尝试一下安装`Vue3`, `pnpm install vue@next`此时默认情况下`vue3`中依赖的模块不会被提升到`node_modules`下。 添加**羞耻的提升**可以将Vue3，所依赖的模块提升到`node_modules`中。

**可以这样理解，我们加入安装了koa框架，而koa框架如果用到了connect模块，安装的时候肯定是会一起下载下来的，如是用npm安装，我们就可以直接使用connect模块的东西，但是如果哪天koa框架升级不再依赖该模块，就会导致我们用不成connect模块了，也就是突然消失了。**



### 配置workspace

新建 **pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

> 将packages下所有的目录都作为包进行管理。这样我们的Monorepo就搭建好了。确实比`lerna + yarn workspace`更快捷

**此时，如果我们在项目根目录下，安装vue**

```shell
pnpm install vue
```

会报错

![image-20220625110548834](README.assets/image-20220625110548834.png)

因为我们安装这个包是作为全局共享包，还是每个包的子包，并没有说清楚：

因此：我们需要加上`-w`

表示作为全局共享包。`-w`也就是 `--workspace-root`

```shell
pnpm i vue -w
```







## 环境搭建

**打包项目Vue3采用rollup进行打包代码，安装打包所需要的依赖**

**也可以先安装需要的模块：**

```shell
pnpm install typescript minimist esbuild  -w -D
```

其他模块可以在后面再安装。

| 依赖                        |                           |
| --------------------------- | ------------------------- |
| typescript                  | 在项目中支持Typescript    |
| rollup                      | 打包工具                  |
| rollup-plugin-typescript2   | rollup 和 ts的 桥梁       |
| @rollup/plugin-json         | 支持引入json              |
| @rollup/plugin-node-resolve | 解析node第三方模块        |
| @rollup/plugin-commonjs     | 将CommonJS转化为ES6Module |
| minimist                    | 命令行参数解析            |
| execa@4                     | 开启子进程                |

```shell
pnpm install typescript rollup rollup-plugin-typescript2 @rollup/plugin-json @rollup/plugin-node-resolve @rollup/plugin-commonjs minimist execa@4 esbuild   -D -w
```

#### 初始化TS

```shell
pnpm tsc --init
```

先添加些常用的`ts-config`配置，后续需要其他的在继续增加

```json
{
  "compilerOptions": {
    "outDir": "dist", // 输出的目录
    "sourceMap": true, // 采用sourcemap
    "target": "es2016", // 目标语法
    "module": "esnext", // 模块格式
    "moduleResolution": "node", // 模块解析方式
    "strict": false, // 严格模式
    "resolveJsonModule": true, // 解析json模块
    "esModuleInterop": true, // 允许通过es6语法引入commonjs模块
    "jsx": "preserve", // jsx 不转义
    "lib": ["esnext", "dom"], // 支持的类库 esnext及dom
     "baseUrl":"./",
      "paths":{
          "@vue/*":["packages/*"]
      }
  }
}
```

### 创建模块

> 我们现在`packages`目录下新建两个package，用于下一章手写响应式原理做准备

- reactivity 响应式模块
- shared 共享模块

**所有包的入口均为`src/index.ts` 这样可以实现统一打包**

- reactivity/package.json

```json
{
  "name": "@vue/reactivity",
  "version": "1.0.0",
  "main": "index.js",
  "module":"dist/reactivity.esm-bundler.js",
  "unpkg": "dist/reactivity.global.js",
  "buildOptions": {
    "name": "VueReactivity",
    "formats": [
      "esm-bundler",
      "cjs",
      "global"
    ]
  }
}
```

- shared/package.json

```json
{
    "name": "@vue/shared",
    "version": "1.0.0",
    "main": "index.js",
    "module": "dist/shared.esm-bundler.js",
    "buildOptions": {
        "formats": [
            "esm-bundler",
            "cjs"
        ]
    }
}
```

**formats**为自定义的打包格式，有`esm-bundler`在构建工具中使用的格式、`esm-browser`在浏览器中使用的格式、`cjs`在node中使用的格式、`global`立即执行函数的格式

```shell
pnpm install @vue/shared@workspace --filter @vue/reactivity
```

**配置`ts`引用关系**

```json
"baseUrl": ".",
"paths": {
    "@vue/*": ["packages/*/src"]
}
```

### 开发环境`esbuild`打包

创建开发时执行脚本， 参数为要打包的模块

**解析用户参数**

```json
"scripts": {
    "dev": "node scripts/dev.js reactivity -f global"
}
```

```js
const { build } = require('esbuild')
const { resolve } = require('path')
const args = require('minimist')(process.argv.slice(2));

const target = args._[0] || 'reactivity';
const format = args.f || 'global';

const pkg = require(resolve(__dirname, `../packages/${target}/package.json`));

const outputFormat = format.startsWith('global')// 输出的格式
    ? 'iife'
    : format === 'cjs'
        ? 'cjs'
        : 'esm'

const outfile = resolve( // 输出的文件
    __dirname,
    `../packages/${target}/dist/${target}.${format}.js`
)

build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: { // 监控文件变化
        onRebuild(error) {
            if (!error) console.log(`rebuilt~~~~`)
        }
    }
}).then(() => {
    console.log('watching~~~')
})
```

### 生产环境`rollup`打包

#### rollup.config.js

```js
import path from 'path';
// 获取packages目录
const packagesDir = path.resolve(__dirname, 'packages');
// 获取对应的模块
const packageDir = path.resolve(packagesDir, process.env.TARGET);
// 全部以打包目录来解析文件
const resolve = p => path.resolve(packageDir, p);
const pkg = require(resolve('package.json'));
const name = path.basename(packageDir); // 获取包的名字

// 配置打包信息
const outputConfigs = {
    'esm-bundler': {
        file: resolve(`dist/${name}.esm-bundler.js`),
        format: 'es'
    },
    cjs: {
        file: resolve(`dist/${name}.cjs.js`),
        format: 'cjs'
    },
    global: {
        file: resolve(`dist/${name}.global.js`),
        format: 'iife'
    }
}
// 获取formats
const packageFormats = process.env.FORMATS &&  process.env.FORMATS.split(',');
const packageConfigs =  packageFormats || pkg.buildOptions.formats;

import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve'
import tsPlugin from 'rollup-plugin-typescript2'

function createConfig(format,output){
    output.sourcemap = process.env.SOURCE_MAP;
    output.exports = 'named'; 
    let external = []
    if(format === 'global'){ 
        output.name = pkg.buildOptions.name
    }else{ // cjs/esm 不需要打包依赖文件
        external = [...Object.keys(pkg.dependencies || {})]
    }
    return {
        input:resolve('src/index.ts'),
        output,
        external,
        plugins:[
            json(),
            tsPlugin(),
            commonjs(),
            nodeResolve()
        ]
    }
}
// 开始打包把
export default packageConfigs.map(format=> createConfig(format,outputConfigs[format]));
```

#### [#](http://zhufengpeixun.com/jg-vue/guide/02.start.html#build-js)build.js

```js
const fs = require('fs');
const execa = require('execa')
const targets = fs.readdirSync('packages').filter(f => {
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
        return false;
    }
    return true;
});
async function runParallel(source, iteratorFn) {
    const ret = [];
    for (const item of source) {
        const p = Promise.resolve().then(() => iteratorFn(item))
        ret.push(p);
    }
    return Promise.all(ret)
}
async function build(target) {
    await execa(
        'rollup',
        [
            '-c',
            '--environment',
            `TARGET:${target}`
        ],
        { stdio: 'inherit' }
    )
}
runParallel(targets, build)
```