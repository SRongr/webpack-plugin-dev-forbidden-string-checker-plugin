const fs = require('fs')
import { Compiler, Compilation, WebpackPluginInstance, NormalModule, Module } from 'webpack';
const { parseComponent, compile } = require('vue-template-compiler')
import { ForbiddenStringCheckerPluginOptions, CheckResults  } from './type'

const DEFAULT_FORBIDDENSTRINGS = [
  />([\u4e00-\u9fa5]+)/g,  // 模版里面的标签 >哈
  /([\u4e00-\u9fa5]+)</g,  // 模板里面的标签 哈<
  />:([\u4e00-\u9fa5]+)/g,  // 模板里面的标签: >:哈
  /label="([\u4e00-\u9fa5]+)/g, // 不写后引号 防止后面有数字或其他匹配不上
  /title="([\u4e00-\u9fa5]+)/g, // 不写后引号 防止后面有数字或其他匹配不上
  /label="([\d]+)([\u4e00-\u9fa5]+)/g, // 先数字在中文 3天前
  /label="([\u4e00-\u9fa5]+)([\d]+)/g, // 先中文再数字 大于3
  /message: ['"]([\u4e00-\u9fa5]+)/g,  // 专匹配报错message 和 form规则
  // /([a-z|A-Z]+): ['"`]([\u4e00-\u9fa5]+)/g  // 匹配各种属性 key-value
]

export class ForbiddenStringCheckerPlugin implements WebpackPluginInstance {

	private options: Required<ForbiddenStringCheckerPluginOptions>;
	private checkResults: CheckResults
  constructor(options: ForbiddenStringCheckerPluginOptions = {}) {
    this.options = {
      forbiddenStrings: options.forbiddenStrings || DEFAULT_FORBIDDENSTRINGS,
      // caseSensitive: options.caseSensitive || false,
      errorMessage: options.errorMessage || '检测到禁止使用的字符规则',
      include: options.include || /\.(js|jsx|ts|tsx|vue)$/,
      exclude: options.exclude || /node_modules/,
      ...options,
    }
    // 存储检查结果
    this.checkResults = {
			warnings: [],
			errors: [],
      // startTime: null,
      // endTime: null,
      // totalModules: 0,
      // checkedModules: [],
      // errors: [],
      // warnings: [],
      // moduleStats: new Map(),
      // files: [],
    }
  }

  removeAllComments(content: string) {
    // 匹配到的多行转换为多行空格，保留原有文档行数
    // const replaceFn = matchStr => matchStr.split('\n').map(() => '\n').join()
    const replaceFn = (matchStr: string) => {
      const matchList = matchStr.split('\n')
      // 匹配注释如果是单行 匹配之外会自己带一个\n  多行注释需要添加行数-1个\n
      return new Array(matchList.length - 1).fill('\n').join()
    }
    return content
      .replace(/<!--[\s\S]*?-->/g, replaceFn)// 移除 HTML 注释 <!-- 注释内容 -->
      .replace(/<!--\[if[\s\S]*?<!\s*\[endif\]-->/g, replaceFn)// 移除条件注释 <!--[if ...]> ... <![endif]-->
      .replace(/\/\/.*$/gm, replaceFn) // 移除单行注释 // ...
      .replace(/\/\*[\s\S]*?\*\//g, replaceFn) // 移除多行注释 /* ... */
      // 清理多余的空行
      .trim()
  }
  processVueFile(source: string) {
    try {
      const parsed = parseComponent(source);
      // let result = source;

      let result = this.removeAllComments(parsed.source)
      return result
    } catch (error) {
      console.warn('Vue file processing failed:', error);
      return source;
    }
  }

  apply(compiler: Compiler) {
    const { forbiddenStrings, errorMessage, include, exclude } =
      this.options as Required<ForbiddenStringCheckerPluginOptions> 

    if (!forbiddenStrings.length) {
      console.warn('ForbiddenStringCheckerPlugin: 未配置禁止字符串规则')
      return
    }

    // 处理字符串匹配规则
    const patterns = forbiddenStrings.map((pattern) => {
			
      if (pattern instanceof RegExp) {
        return pattern
      }
      return new RegExp(pattern, 'g')
    })


    compiler.hooks.compilation.tap(
      'ForbiddenStringCheckerPlugin',
      (compilation: Compilation) => {

        compilation.hooks.succeedModule.tap(
          'ForbiddenStringCheckerPlugin',
          (module: any) => {
						let filename: string

						if (module.resource) {
								filename = module.resource;
						} else {
							return;
						}
						// if (module instanceof NormalModule) {
						// 	// NormalModule 是物理文件 有resource 。 其他类型例如外部依赖就没有resource
						// 	filename = module.resource as string
						// } else {
						// 	return
						// }
           
            // 将当前文件匹配的问题清空 重新检查
            if (
              include.test(filename) &&
              !exclude.test(filename)
            ) {
              // console.log('filename:', filename)
              // console.log('length:', this.checkResults.errors.length)

              this.checkResults.errors = this.checkResults.errors.filter(item => {
                return item.filename !== filename 
              })
              // console.log('length Filter:', this.checkResults.errors.length)
              const source = fs.readFileSync(filename, 'utf-8')
              const resultSource = this.processVueFile(source) // 解析文档
              // console.log(, filename)
              if (!resultSource) {
                console.log(resultSource, '这次没有', filename)
              }

              patterns.forEach((pattern, index) => {
                const matches = resultSource.match(pattern)
                if (matches) {
                  // 获取原始字符串用于错误信息
                  const originalString =
                    typeof forbiddenStrings[index] === 'string'
                      ? forbiddenStrings[index]
                      : pattern.toString()
                  // const errorLocation = matches[0]
                  matches.forEach(matchItem => {
                    const errorLocation = matchItem
                    // 查找匹配位置（简化版，实际项目中可以使用更精确的位置计算）
                  const lines = resultSource.split('\n')
                  let lineNumber = 1
                  let column = 0

                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i]
                    const matchIndex = line.search(errorLocation)
                    if (matchIndex !== -1) {
                      lineNumber = i + 1
                      column = matchIndex + 1
                      break
                    }
                  }

                  this.checkResults.errors.push({
                    filename: filename,
                    location: ` ${lineNumber}:${column} `,
                    forbiddenOrigin: errorLocation,
                    message: `${errorMessage}: "${originalString}" 命中匹配的字符串为: ${errorLocation}`,
                  })
                  })
                  
                }
              })
              // }

              // // 如果有错误，抛出编译错误
              if (this.checkResults.errors.length > 0) {
                const errorDetails = this.checkResults.errors
                  .map(
                    (error) => {
                      // console.log(error)
                      return `文件: ${error.filename}\n位置: ${error.location}列\n错误: ${error.forbiddenOrigin}`
                    }
                      
                  )
                  .join('\n\n')
                  
                // compilation.warnings.push(
                //   new Error(
                //     `\n🚫 检测到禁止使用的字符串:\n\n${errorDetails}\n\n总共发现 ${errors.length} 个错误`
                //   )
                // )
              }

            }
          }
        )
      }
    )

    // 使用 compiler 钩子进行全局统计
    compiler.hooks.done.tap('ForbiddenStringCheckerPlugin', (stats) => {
      // this.generateCodeQualityReport(stats); // 全局统计报告
      const errors = this.checkResults.errors.map((item, index) => {
        return {
          filaname: item.filename + item.location,
          message: item.message,
          index: index
        }
      })
      console.log(errors)
      console.log(`ForbiddenStringCheckerPlugin: 共发现${errors.length}处命中匹配规则`)
      
    })
  }
}

// module.exports = ForbiddenStringCheckerPlugin
