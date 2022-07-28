import { OperationElement } from "@apollo/federation-internals";
export declare function isPathContext(v: any): v is PathContext;
export declare class PathContext {
    readonly directives: [string, any][];
    constructor(directives: [string, any][]);
    isEmpty(): boolean;
    size(): number;
    withContextOf(operation: OperationElement): PathContext;
    equals(that: PathContext): boolean;
    toString(): string;
}
export declare const emptyContext: PathContext;
//# sourceMappingURL=pathContext.d.ts.map