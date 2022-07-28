import { FieldDefinition, CompositeType, SchemaRootKind } from "@apollo/federation-internals";
export declare type Transition = FieldCollection | DownCast | KeyResolution | RootTypeResolution | SubgraphEnteringTransition;
export declare class KeyResolution {
    readonly kind: "KeyResolution";
    readonly collectOperationElements: false;
    toString(): string;
}
export declare class RootTypeResolution {
    readonly rootKind: SchemaRootKind;
    readonly kind: "RootTypeResolution";
    readonly collectOperationElements: false;
    constructor(rootKind: SchemaRootKind);
    toString(): string;
}
export declare class FieldCollection {
    readonly definition: FieldDefinition<CompositeType>;
    readonly isPartOfProvide: boolean;
    readonly kind: "FieldCollection";
    readonly collectOperationElements: true;
    constructor(definition: FieldDefinition<CompositeType>, isPartOfProvide?: boolean);
    toString(): string;
}
export declare class DownCast {
    readonly sourceType: CompositeType;
    readonly castedType: CompositeType;
    readonly kind: "DownCast";
    readonly collectOperationElements: true;
    constructor(sourceType: CompositeType, castedType: CompositeType);
    toString(): string;
}
export declare class SubgraphEnteringTransition {
    readonly kind: "SubgraphEnteringTransition";
    readonly collectOperationElements: false;
    toString(): string;
}
export declare const subgraphEnteringTransition: SubgraphEnteringTransition;
//# sourceMappingURL=transition.d.ts.map