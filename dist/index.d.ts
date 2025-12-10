import { Compiler, WebpackPluginInstance } from 'webpack';
import { ForbiddenStringCheckerPluginOptions } from './type';
export declare class ForbiddenStringCheckerPlugin implements WebpackPluginInstance {
    private options;
    private checkResults;
    constructor(options?: ForbiddenStringCheckerPluginOptions);
    removeAllComments(content: string): string;
    processVueFile(source: string): string;
    apply(compiler: Compiler): void;
}
//# sourceMappingURL=index.d.ts.map