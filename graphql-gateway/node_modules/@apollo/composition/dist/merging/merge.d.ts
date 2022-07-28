import { Schema, SubtypingRule, Subgraphs } from "@apollo/federation-internals";
import { GraphQLError } from "graphql";
import { CompositionHint } from "../hints";
export declare type MergeResult = MergeSuccess | MergeFailure;
export declare type CompositionOptions = {
    allowedFieldTypeMergingSubtypingRules?: SubtypingRule[];
};
export interface MergeSuccess {
    supergraph: Schema;
    hints: CompositionHint[];
    errors?: undefined;
}
export interface MergeFailure {
    errors: GraphQLError[];
    supergraph?: undefined;
    hints?: undefined;
}
export declare function isMergeSuccessful(mergeResult: MergeResult): mergeResult is MergeSuccess;
export declare function isMergeFailure(mergeResult: MergeResult): mergeResult is MergeFailure;
export declare function mergeSubgraphs(subgraphs: Subgraphs, options?: CompositionOptions): MergeResult;
//# sourceMappingURL=merge.d.ts.map