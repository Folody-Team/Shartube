"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subgraphEnteringTransition = exports.SubgraphEnteringTransition = exports.DownCast = exports.FieldCollection = exports.RootTypeResolution = exports.KeyResolution = void 0;
class KeyResolution {
    constructor() {
        this.kind = 'KeyResolution';
        this.collectOperationElements = false;
    }
    toString() {
        return 'key()';
    }
}
exports.KeyResolution = KeyResolution;
class RootTypeResolution {
    constructor(rootKind) {
        this.rootKind = rootKind;
        this.kind = 'RootTypeResolution';
        this.collectOperationElements = false;
    }
    toString() {
        return this.rootKind + '()';
    }
}
exports.RootTypeResolution = RootTypeResolution;
class FieldCollection {
    constructor(definition, isPartOfProvide = false) {
        this.definition = definition;
        this.isPartOfProvide = isPartOfProvide;
        this.kind = 'FieldCollection';
        this.collectOperationElements = true;
    }
    toString() {
        return this.definition.name;
    }
}
exports.FieldCollection = FieldCollection;
class DownCast {
    constructor(sourceType, castedType) {
        this.sourceType = sourceType;
        this.castedType = castedType;
        this.kind = 'DownCast';
        this.collectOperationElements = true;
    }
    toString() {
        return '... on ' + this.castedType.name;
    }
}
exports.DownCast = DownCast;
class SubgraphEnteringTransition {
    constructor() {
        this.kind = 'SubgraphEnteringTransition';
        this.collectOperationElements = false;
    }
    toString() {
        return '∅';
    }
}
exports.SubgraphEnteringTransition = SubgraphEnteringTransition;
exports.subgraphEnteringTransition = new SubgraphEnteringTransition();
//# sourceMappingURL=transition.js.map