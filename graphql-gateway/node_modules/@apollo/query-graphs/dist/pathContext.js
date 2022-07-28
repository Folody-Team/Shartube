"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyContext = exports.PathContext = exports.isPathContext = void 0;
const federation_internals_1 = require("@apollo/federation-internals");
const deep_equal_1 = __importDefault(require("deep-equal"));
function isPathContext(v) {
    return v instanceof PathContext;
}
exports.isPathContext = isPathContext;
function addExtractedDirective(operation, directiveName, addTo) {
    const applied = operation.appliedDirectivesOf(directiveName);
    if (applied.length > 0) {
        (0, federation_internals_1.assert)(applied.length === 1, () => `${directiveName} shouldn't be repeated on ${operation}`);
        const value = applied[0].arguments()['if'];
        addTo.push([directiveName, value]);
    }
}
class PathContext {
    constructor(directives) {
        this.directives = directives;
    }
    isEmpty() {
        return this.directives.length === 0;
    }
    size() {
        return this.directives.length;
    }
    withContextOf(operation) {
        if (operation.appliedDirectives.length === 0) {
            return this;
        }
        const newDirectives = [];
        addExtractedDirective(operation, 'skip', newDirectives);
        addExtractedDirective(operation, 'include', newDirectives);
        return newDirectives.length === 0
            ? this
            : new PathContext(newDirectives.concat(this.directives));
    }
    equals(that) {
        return (0, deep_equal_1.default)(this.directives, that.directives);
    }
    toString() {
        return '[' + this.directives.map(([name, cond]) => `@${name}(if: ${cond})`).join(', ') + ']';
    }
}
exports.PathContext = PathContext;
exports.emptyContext = new PathContext([]);
//# sourceMappingURL=pathContext.js.map