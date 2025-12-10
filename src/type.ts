

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




interface ResultItem {
	filename: string, // 文件路径
	location: string,	// 报错位置 line:col
	forbiddenOrigin: string, // 报错文字
	message: string // 报错信息
	
}

/**
 * 存储检查见过
 */
export interface CheckResults {
	warnings: Array<ResultItem>,
	errors: Array<ResultItem>,
}