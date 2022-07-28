import { Schema, Subgraphs, ServiceDefinition } from "@apollo/federation-internals";
import { GraphQLError } from "graphql";
import { CompositionHint } from "./hints";
export declare type CompositionResult = CompositionFailure | CompositionSuccess;
export interface CompositionFailure {
    errors: GraphQLError[];
    schema?: undefined;
    supergraphSdl?: undefined;
    hints?: undefined;
}
export interface CompositionSuccess {
    schema: Schema;
    supergraphSdl: string;
    hints: CompositionHint[];
    errors?: undefined;
}
export declare function compose(subgraphs: Subgraphs): CompositionResult;
export declare function composeServices(services: ServiceDefinition[]): CompositionResult;
//# sourceMappingURL=compose.d.ts.map