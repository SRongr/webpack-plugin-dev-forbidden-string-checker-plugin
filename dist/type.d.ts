/**
 * plugin options
 * @param forbiddenStrings 检查的正则
 * @param errorMessage 报错的提示信息
 * @param include 检查的文件包含
 * @param exclude 不包含的内容 /node_modules/
 * @param forbiddenStrings 检查的正则
 */
export interface ForbiddenStringCheckerPluginOptions {
    forbiddenStrings?: Array<RegExp>;
    errorMessage?: string;
    include?: RegExp;
    exclude?: RegExp;
}
interface ResultItem {
    filename: string;
    location: string;
    forbiddenOrigin: string;
    message: string;
}
/**
 * 存储检查见过
 */
export interface CheckResults {
    warnings: Array<ResultItem>;
    errors: Array<ResultItem>;
}
export {};
//# sourceMappingURL=type.d.ts.map