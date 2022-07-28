import { AbstractType, InterfaceType, ObjectType, Type, UnionType } from "./definitions";
export declare const ALL_SUBTYPING_RULES: ("direct" | "nonNullable_downgrade" | "list_upgrade" | "list_propagation" | "nonNullable_propagation")[];
export declare type SubtypingRule = typeof ALL_SUBTYPING_RULES[number];
export declare const DEFAULT_SUBTYPING_RULES: ("direct" | "nonNullable_downgrade" | "list_upgrade" | "list_propagation" | "nonNullable_propagation")[];
export declare function sameType(t1: Type, t2: Type): boolean;
export declare function isDirectSubtype(type: AbstractType, maybeSubType: ObjectType | InterfaceType, unionMembershipTester?: (union: UnionType, maybeMember: ObjectType) => boolean, implementsInterfaceTester?: (maybeImplementer: ObjectType | InterfaceType, itf: InterfaceType) => boolean): boolean;
export declare function isSubtype(type: Type, maybeSubType: Type, allowedRules?: SubtypingRule[], unionMembershipTester?: (union: UnionType, maybeMember: ObjectType) => boolean, implementsInterfaceTester?: (maybeImplementer: ObjectType | InterfaceType, itf: InterfaceType) => boolean): boolean;
export declare function isStrictSubtype(type: Type, maybeSubType: Type, allowedRules?: SubtypingRule[], unionMembershipTester?: (union: UnionType, maybeMember: ObjectType) => boolean, implementsInterfaceTester?: (maybeImplementer: ObjectType | InterfaceType, itf: InterfaceType) => boolean): boolean;
//# sourceMappingURL=types.d.ts.map