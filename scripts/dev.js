// 拿到执行脚本时 的参数
// minimist 解析命令行参数
const args = require("minimist")(process.argv.slice(2));
const { build } = require("esbuild");
const { resolve } = require("path");
// 默认参数在 _属性上 { _: [ 'reactivity' ], f: 'global' }

// 打包目标
const target = args._[0] || "reactivity";
const format = args.f || "global";

console.log();
// 开发环境 只打包某一个
const pkg = require(resolve(__dirname, "../packages", target, "package.json"));
// 输出格式
const outputFormat = format.startsWith("global")
  ? "iife"
  : format === "cjs"
  ? "cjs"
  : "esm";

const outfile = resolve(
  __dirname,
  `../packages/${target}/dist/${target}.${format}.js`
);

// build 直接支持ts
build({
  entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
  outfile:outfile,
  bundle: true,// 把所有的包全部打包到一起
  sourcemap: true,// 生成sourcemap
  format: outputFormat, // 打包格式
  globalName: pkg.buildOptions?.name,// 全局包名
  platform: format === 'cjs' ? 'node' : 'browser', // 平台
  watch: { // 监控文件变化
      onRebuild(error) {
          if (!error) console.log(`rebuilt~~~~`)
      }
  }
}).then(() => {
  console.log('watching~~~')
})