import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: './src/index',
      name: 'index',

      format: 'cjs'  // 明确指定格式
    }
    // './src/index',
    // './src/types/'
  ],
  declaration: true,        // 自动生成 .d.ts
  clean: true,             // 构建前清理
  rollup: {
    emitCJS: true,        // 生成 CommonJS
    esbuild: {
      target: 'es2015'
    }
  },
  externals: [
    'webpack',
    'webpack-sources'     // 外部依赖，不打包
  ]
})