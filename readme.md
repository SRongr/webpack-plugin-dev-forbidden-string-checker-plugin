#### 参数
```ts
/**
 * plugin options
 * @param forbiddenStrings 检查的正则
 * @param errorMessage 报错的提示信息
 * @param include 检查的文件包含
 * @param exclude 不包含的内容 /node_modules/
 * @param forbiddenStrings 检查的正则
 */
export interface ForbiddenStringCheckerPluginOptions {
	forbiddenStrings?: Array<RegExp>
	// caseSensitive: options.caseSensitive || false,
	errorMessage?: string,
	include?: RegExp,
	exclude?: RegExp,
}

```

#### defaultOptions 
```js
const DEFAULT_FORBIDDENSTRINGS = [
	/>([\u4e00-\u9fa5]+)/g, // 模版里面的标签 >哈
	/([\u4e00-\u9fa5]+)</g, // 模板里面的标签 哈<
	/>:([\u4e00-\u9fa5]+)/g, // 模板里面的标签: >:哈
	/label="([\u4e00-\u9fa5]+)/g, // 不写后引号 防止后面有数字或其他匹配不上
	/title="([\u4e00-\u9fa5]+)/g, // 不写后引号 防止后面有数字或其他匹配不上
	/label="([\d]+)([\u4e00-\u9fa5]+)/g, // 先数字在中文 3天前
	/label="([\u4e00-\u9fa5]+)([\d]+)/g, // 先中文再数字 大于3
	/message: ['"]([\u4e00-\u9fa5]+)/g,  // 专匹配报错message 和 form规则
	// /([a-z|A-Z]+): ['"`]([\u4e00-\u9fa5]+)/g // 匹配各种属性 key-value
];
this.options = {
	forbiddenStrings: options.forbiddenStrings || DEFAULT_FORBIDDENSTRINGS,
	// caseSensitive: options.caseSensitive || false,
	errorMessage: options.errorMessage || '检测到禁止使用的字符规则',
	include: options.include || /\.(js|jsx|ts|tsx|vue)$/,
	exclude: options.exclude || /node_modules/,
	...options,
}
```
#### demo 
`vue.config.js`
```js
...

configureWebpack: {
    plugins: [
      new MonacoEditorPlugin({
        // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['javascript', 'typescript', 'sql', 'java']
      }),
      // new RemoveVueCommentsPlugin()
      new ForbiddenStringCheckerPlugin({
        // >中文<
        // forbiddenStrings: [/>([\u4e00-\u9fa5]+)/, /([\u4e00-\u9fa5]+)</, /:([\u4e00-\u9fa5]+)/, /label="([\u4e00-\u9fa5]+)"/, /title="([\u4e00-\u9fa5]+)"/],
        errorMessage: '检测到禁止使用的字符规则',
        include: /\.vue$/,
        exclude: /(node_modules)|(yzsm_files)/,
      })
    ]
  }
```

#