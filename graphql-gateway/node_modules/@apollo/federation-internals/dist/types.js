"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStrictSubtype = exports.isSubtype = exports.isDirectSubtype = exports.sameType = exports.DEFAULT_SUBTYPING_RULES = exports.ALL_SUBTYPING_RULES = void 0;
const definitions_1 = require("./definitions");
exports.ALL_SUBTYPING_RULES = [
    'direct',
    'nonNullable_downgrade',
    'list_upgrade',
    'list_propagation',
    'nonNullable_propagation'
];
exports.DEFAULT_SUBTYPING_RULES = exports.ALL_SUBTYPING_RULES.filter(r => r !== "list_upgrade");
function sameType(t1, t2) {
    if (t1.kind !== t2.kind) {
        return false;
    }
    switch (t1.kind) {
        case 'ListType':
            return sameType(t1.ofType, t2.ofType);
        case 'NonNullType':
            return sameType(t1.ofType, t2.ofType);
        default:
            return t1.name === t2.name;
    }
}
exports.sameType = sameType;
function isDirectSubtype(type, maybeSubType, unionMembershipTester = (u, m) => u.hasTypeMember(m), implementsInterfaceTester = (m, i) => m.implementsInterface(i)) {
    if ((0, definitions_1.isUnionType)(type)) {
        return (0, definitions_1.isObjectType)(maybeSubType) && unionMembershipTester(type, maybeSubType);
    }
    return implementsInterfaceTester(maybeSubType, type);
}
exports.isDirectSubtype = isDirectSubtype;
function isSubtype(type, maybeSubType, allowedRules = exports.DEFAULT_SUBTYPING_RULES, unionMembershipTester = (u, m) => u.hasTypeMember(m), implementsInterfaceTester = (m, i) => m.implementsInterface(i)) {
    return sameType(type, maybeSubType) || isStrictSubtype(type, maybeSubType, allowedRules, unionMembershipTester, implementsInterfaceTester);
}
exports.isSubtype = isSubtype;
function isStrictSubtype(type, maybeSubType, allowedRules = exports.DEFAULT_SUBTYPING_RULES, unionMembershipTester = (u, m) => u.hasTypeMember(m), implementsInterfaceTester = (m, i) => m.implementsInterface(i)) {
    switch (maybeSubType.kind) {
        case 'ListType':
            return allowedRules.includes('list_propagation')
                && (0, definitions_1.isListType)(type)
                && isSubtype(type.ofType, maybeSubType.ofType, allowedRules, unionMembershipTester, implementsInterfaceTester);
        case 'NonNullType':
            if ((0, definitions_1.isNonNullType)(type)) {
                return allowedRules.includes('nonNullable_propagation')
                    && isSubtype(type.ofType, maybeSubType.ofType, allowedRules, unionMembershipTester, implementsInterfaceTester);
            }
            return allowedRules.includes('nonNullable_downgrade')
                && isSubtype(type, maybeSubType.ofType, allowedRules, unionMembershipTester, implementsInterfaceTester);
        case 'ObjectType':
        case 'InterfaceType':
            if ((0, definitions_1.isListType)(type)) {
                return allowedRules.includes('list_upgrade')
                    && isSubtype(type.ofType, maybeSubType, allowedRules, unionMembershipTester, implementsInterfaceTester);
            }
            return allowedRules.includes('direct')
                && ((0, definitions_1.isInterfaceType)(type) || (0, definitions_1.isUnionType)(type))
                && isDirectSubtype(type, maybeSubType, unionMembershipTester, implementsInterfaceTester);
        default:
            return (0, definitions_1.isListType)(type)
                && allowedRules.includes('list_upgrade')
                && isSubtype(type.ofType, maybeSubType, allowedRules, unionMembershipTester, implementsInterfaceTester);
    }
}
exports.isStrictSubtype = isStrictSubtype;
//# sourceMappingURL=types.js.map