import { GraphPath, OpGraphPath, OpTrigger } from "./graphPath";
import { Edge, QueryGraph, RootVertex, Vertex } from "./querygraph";
export declare class PathTree<TTrigger, RV extends Vertex = Vertex, TNullEdge extends null | never = never> {
    readonly graph: QueryGraph;
    readonly vertex: RV;
    private readonly triggerEquality;
    private readonly childs;
    private constructor();
    static create<TTrigger, RV extends Vertex = Vertex, TNullEdge extends null | never = never>(graph: QueryGraph, root: RV, triggerEquality: (t1: TTrigger, t2: TTrigger) => boolean): PathTree<TTrigger, RV, TNullEdge>;
    static createOp<RV extends Vertex = Vertex>(graph: QueryGraph, root: RV): OpPathTree<RV>;
    static createFromOpPaths<RV extends Vertex = Vertex>(graph: QueryGraph, root: RV, paths: OpGraphPath<RV>[]): OpPathTree<RV>;
    private static createFromPaths;
    static mergeAllOpTrees<RV extends Vertex = Vertex>(graph: QueryGraph, root: RV, trees: OpPathTree<RV>[]): OpPathTree<RV>;
    private static mergeAllTreesInternal;
    childCount(): number;
    isLeaf(): boolean;
    childElements(reverseOrder?: boolean): Generator<[Edge | TNullEdge, TTrigger, OpPathTree | null, PathTree<TTrigger, Vertex, TNullEdge>], void, undefined>;
    private element;
    private mergeChilds;
    mergeIfNotEqual(other: PathTree<TTrigger, RV, TNullEdge>): PathTree<TTrigger, RV, TNullEdge>;
    merge(other: PathTree<TTrigger, RV, TNullEdge>): PathTree<TTrigger, RV, TNullEdge>;
    private equalsSameRoot;
    concat(other: PathTree<TTrigger, RV, TNullEdge>): PathTree<TTrigger, RV, TNullEdge>;
    mergePath(path: GraphPath<TTrigger, RV, TNullEdge>): PathTree<TTrigger, RV, TNullEdge>;
    private childsFromPathElements;
    private mergePathInternal;
    private findIndex;
    isAllInSameSubgraph(): boolean;
    private isAllInSameSubgraphInternal;
    toString(indent?: string, includeConditions?: boolean): string;
    private toStringInternal;
}
export declare type RootPathTree<TTrigger, TNullEdge extends null | never = never> = PathTree<TTrigger, RootVertex, TNullEdge>;
export declare type OpPathTree<RV extends Vertex = Vertex> = PathTree<OpTrigger, RV, null>;
export declare type OpRootPathTree = OpPathTree<RootVertex>;
export declare function isRootPathTree(tree: OpPathTree<any>): tree is OpRootPathTree;
export declare function traversePathTree<TTrigger, RV extends Vertex = Vertex, TNullEdge extends null | never = never>(pathTree: PathTree<TTrigger, RV, TNullEdge>, onEdges: (edge: Edge) => void): void;
//# sourceMappingURL=pathTree.d.ts.map