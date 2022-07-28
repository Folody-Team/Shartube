import { QueryGraph } from "./querygraph";
import { RootPath } from "./graphPath";
export declare function toDot(graph: QueryGraph, config?: DotGraphConfig): string;
export declare function groupToDot(name: string, graphs: Map<string, QueryGraph>, configs?: Map<string, DotGraphConfig>): string;
export declare type DotGraphConfig = {
    highlightedPaths?: HighlitedPath[];
    noTerminal?: boolean;
};
export declare function pickHighlights(paths: RootPath<any>[], excluded?: string[]): HighlitedPath[];
declare type HighlitedPath = {
    path: RootPath<any>;
    color: string;
};
export {};
//# sourceMappingURL=graphviz.d.ts.map