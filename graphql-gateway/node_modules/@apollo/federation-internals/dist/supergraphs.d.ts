import { DocumentNode } from "graphql";
import { CoreFeature, CoreFeatures, Schema } from "./definitions";
import { JoinSpecDefinition } from "./joinSpec";
export declare function ErrUnsupportedFeature(feature: CoreFeature): Error;
export declare function ErrForUnsupported(core: CoreFeature, ...features: readonly CoreFeature[]): Error;
export declare function buildSupergraphSchema(supergraphSdl: string | DocumentNode): [Schema, {
    name: string;
    url: string;
}[]];
export declare function validateSupergraph(supergraph: Schema): [CoreFeatures, JoinSpecDefinition];
export declare function isFed1Supergraph(supergraph: Schema): boolean;
//# sourceMappingURL=supergraphs.d.ts.map