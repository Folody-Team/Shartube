"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traversePathTree = exports.isRootPathTree = exports.PathTree = void 0;
const federation_internals_1 = require("@apollo/federation-internals");
const querygraph_1 = require("./querygraph");
const pathContext_1 = require("./pathContext");
function opTriggerEquality(t1, t2) {
    if (t1 === t2) {
        return true;
    }
    if ((0, pathContext_1.isPathContext)(t1)) {
        return (0, pathContext_1.isPathContext)(t2) && t1.equals(t2);
    }
    if ((0, pathContext_1.isPathContext)(t2)) {
        return false;
    }
    return t1.equals(t2);
}
function findTriggerIdx(triggerEquality, forIndex, trigger) {
    for (let i = 0; i < forIndex.length; i++) {
        if (triggerEquality(forIndex[i][0], trigger)) {
            return i;
        }
    }
    return -1;
}
class PathTree {
    constructor(graph, vertex, triggerEquality, childs) {
        this.graph = graph;
        this.vertex = vertex;
        this.triggerEquality = triggerEquality;
        this.childs = childs;
    }
    static create(graph, root, triggerEquality) {
        return new PathTree(graph, root, triggerEquality, []);
    }
    static createOp(graph, root) {
        return this.create(graph, root, opTriggerEquality);
    }
    static createFromOpPaths(graph, root, paths) {
        (0, federation_internals_1.assert)(paths.length > 0, `Should compute on empty paths`);
        return this.createFromPaths(graph, opTriggerEquality, root, paths.map(p => p[Symbol.iterator]()));
    }
    static createFromPaths(graph, triggerEquality, currentVertex, paths) {
        const maxEdges = graph.outEdges(currentVertex).length;
        const forEdgeIndex = new Array(maxEdges + 1);
        const newVertices = new Array(maxEdges);
        const order = new Array(maxEdges + 1);
        let currentOrder = 0;
        let totalChilds = 0;
        for (const path of paths) {
            const iterResult = path.next();
            if (iterResult.done) {
                continue;
            }
            const [edge, trigger, conditions] = iterResult.value;
            const idx = edge ? edge.index : maxEdges;
            if (edge) {
                newVertices[idx] = edge.tail;
            }
            const forIndex = forEdgeIndex[idx];
            if (forIndex) {
                const triggerIdx = findTriggerIdx(triggerEquality, forIndex, trigger);
                if (triggerIdx < 0) {
                    forIndex.push([trigger, conditions, [path]]);
                    totalChilds++;
                }
                else {
                    const existing = forIndex[triggerIdx];
                    const existingCond = existing[1];
                    const mergedConditions = existingCond ? (conditions ? existingCond.mergeIfNotEqual(conditions) : existingCond) : conditions;
                    const newPaths = existing[2];
                    newPaths.push(path);
                    forIndex[triggerIdx] = [trigger, mergedConditions, newPaths];
                }
            }
            else {
                order[currentOrder++] = idx;
                forEdgeIndex[idx] = [[trigger, conditions, [path]]];
                totalChilds++;
            }
        }
        const childs = new Array(totalChilds);
        let idx = 0;
        for (let i = 0; i < currentOrder; i++) {
            const edgeIndex = order[i];
            const index = (edgeIndex === maxEdges ? null : edgeIndex);
            const newVertex = index === null ? currentVertex : newVertices[edgeIndex];
            const values = forEdgeIndex[edgeIndex];
            for (const [trigger, conditions, subPaths] of values) {
                childs[idx++] = {
                    index,
                    trigger,
                    conditions,
                    tree: this.createFromPaths(graph, triggerEquality, newVertex, subPaths)
                };
            }
        }
        (0, federation_internals_1.assert)(idx === totalChilds, () => `Expected to have ${totalChilds} childs but only ${idx} added`);
        return new PathTree(graph, currentVertex, triggerEquality, childs);
    }
    static mergeAllOpTrees(graph, root, trees) {
        return this.mergeAllTreesInternal(graph, opTriggerEquality, root, trees);
    }
    static mergeAllTreesInternal(graph, triggerEquality, currentVertex, trees) {
        const maxEdges = graph.outEdges(currentVertex).length;
        const forEdgeIndex = new Array(maxEdges + 1);
        const newVertices = new Array(maxEdges);
        const order = new Array(maxEdges + 1);
        let currentOrder = 0;
        let totalChilds = 0;
        for (const tree of trees) {
            for (const child of tree.childs) {
                const idx = child.index === null ? maxEdges : child.index;
                if (!newVertices[idx]) {
                    newVertices[idx] = child.tree.vertex;
                }
                const forIndex = forEdgeIndex[idx];
                if (forIndex) {
                    const triggerIdx = findTriggerIdx(triggerEquality, forIndex, child.trigger);
                    if (triggerIdx < 0) {
                        forIndex.push([child.trigger, child.conditions, [child.tree]]);
                        totalChilds++;
                    }
                    else {
                        const existing = forIndex[triggerIdx];
                        const existingCond = existing[1];
                        const mergedConditions = existingCond ? (child.conditions ? existingCond.mergeIfNotEqual(child.conditions) : existingCond) : child.conditions;
                        const newTrees = existing[2];
                        newTrees.push(child.tree);
                        forIndex[triggerIdx] = [child.trigger, mergedConditions, newTrees];
                    }
                }
                else {
                    order[currentOrder++] = idx;
                    forEdgeIndex[idx] = [[child.trigger, child.conditions, [child.tree]]];
                    totalChilds++;
                }
            }
        }
        const childs = new Array(totalChilds);
        let idx = 0;
        for (let i = 0; i < currentOrder; i++) {
            const edgeIndex = order[i];
            const index = (edgeIndex === maxEdges ? null : edgeIndex);
            const newVertex = index === null ? currentVertex : newVertices[edgeIndex];
            const values = forEdgeIndex[edgeIndex];
            for (const [trigger, conditions, subTrees] of values) {
                childs[idx++] = {
                    index,
                    trigger,
                    conditions,
                    tree: this.mergeAllTreesInternal(graph, triggerEquality, newVertex, subTrees)
                };
            }
        }
        (0, federation_internals_1.assert)(idx === totalChilds, () => `Expected to have ${totalChilds} childs but only ${idx} added`);
        return new PathTree(graph, currentVertex, triggerEquality, childs);
    }
    childCount() {
        return this.childs.length;
    }
    isLeaf() {
        return this.childCount() === 0;
    }
    *childElements(reverseOrder = false) {
        if (reverseOrder) {
            for (let i = this.childs.length - 1; i >= 0; i--) {
                yield this.element(i);
            }
        }
        else {
            for (let i = 0; i < this.childs.length; i++) {
                yield this.element(i);
            }
        }
    }
    element(i) {
        const child = this.childs[i];
        return [
            (child.index === null ? null : this.graph.outEdge(this.vertex, child.index)),
            child.trigger,
            child.conditions,
            child.tree
        ];
    }
    mergeChilds(c1, c2) {
        const cond1 = c1.conditions;
        const cond2 = c2.conditions;
        return {
            index: c1.index,
            trigger: c1.trigger,
            conditions: cond1 ? (cond2 ? cond1.mergeIfNotEqual(cond2) : cond1) : cond2,
            tree: c1.tree.merge(c2.tree)
        };
    }
    mergeIfNotEqual(other) {
        if (this.equalsSameRoot(other)) {
            return this;
        }
        return this.merge(other);
    }
    merge(other) {
        if (this === other) {
            return this;
        }
        (0, federation_internals_1.assert)(other.graph === this.graph, 'Cannot merge path tree build on another graph');
        (0, federation_internals_1.assert)(other.vertex.index === this.vertex.index, () => `Cannot merge path tree rooted at vertex ${other.vertex} into tree rooted at other vertex ${this.vertex}`);
        if (!other.childs.length) {
            return this;
        }
        if (!this.childs.length) {
            return other;
        }
        const mergeIndexes = new Array(other.childs.length);
        let countToAdd = 0;
        for (let i = 0; i < other.childs.length; i++) {
            const otherChild = other.childs[i];
            const idx = this.findIndex(otherChild.trigger, otherChild.index);
            mergeIndexes[i] = idx;
            if (idx < 0) {
                ++countToAdd;
            }
        }
        const thisSize = this.childs.length;
        const newSize = thisSize + countToAdd;
        const newChilds = (0, federation_internals_1.copyWitNewLength)(this.childs, newSize);
        let addIdx = thisSize;
        for (let i = 0; i < other.childs.length; i++) {
            const idx = mergeIndexes[i];
            if (idx < 0) {
                newChilds[addIdx++] = other.childs[i];
            }
            else {
                newChilds[idx] = this.mergeChilds(newChilds[idx], other.childs[i]);
            }
        }
        (0, federation_internals_1.assert)(addIdx === newSize, () => `Expected ${newSize} childs but only got ${addIdx}`);
        return new PathTree(this.graph, this.vertex, this.triggerEquality, newChilds);
    }
    equalsSameRoot(that) {
        if (this === that) {
            return true;
        }
        return (0, federation_internals_1.arrayEquals)(this.childs, that.childs, (c1, c2) => {
            return c1.index === c2.index
                && c1.trigger === c2.trigger
                && (c1.conditions ? (c2.conditions ? c1.conditions.equalsSameRoot(c2.conditions) : false) : !c2.conditions)
                && c1.tree.equalsSameRoot(c2.tree);
        });
    }
    concat(other) {
        (0, federation_internals_1.assert)(other.graph === this.graph, 'Cannot concat path tree build on another graph');
        (0, federation_internals_1.assert)(other.vertex.index === this.vertex.index, () => `Cannot concat path tree rooted at vertex ${other.vertex} into tree rooted at other vertex ${this.vertex}`);
        if (!other.childs.length) {
            return this;
        }
        if (!this.childs.length) {
            return other;
        }
        const newChilds = this.childs.concat(other.childs);
        return new PathTree(this.graph, this.vertex, this.triggerEquality, newChilds);
    }
    mergePath(path) {
        (0, federation_internals_1.assert)(path.graph === this.graph, 'Cannot merge path build on another graph');
        (0, federation_internals_1.assert)(path.root.index === this.vertex.index, () => `Cannot merge path rooted at vertex ${path.root} into tree rooted at other vertex ${this.vertex}`);
        return this.mergePathInternal(path[Symbol.iterator]());
    }
    childsFromPathElements(currentVertex, elements) {
        const iterResult = elements.next();
        if (iterResult.done) {
            return [];
        }
        const [edge, trigger, conditions] = iterResult.value;
        const edgeIndex = (edge ? edge.index : null);
        currentVertex = edge ? edge.tail : currentVertex;
        return [{
                index: edgeIndex,
                trigger: trigger,
                conditions: conditions,
                tree: new PathTree(this.graph, currentVertex, this.triggerEquality, this.childsFromPathElements(currentVertex, elements))
            }];
    }
    mergePathInternal(elements) {
        const iterResult = elements.next();
        if (iterResult.done) {
            return this;
        }
        const [edge, trigger, conditions] = iterResult.value;
        (0, federation_internals_1.assert)(!edge || edge.head.index === this.vertex.index, () => `Next element head of ${edge} is not equal to current tree vertex ${this.vertex}`);
        const edgeIndex = (edge ? edge.index : null);
        const idx = this.findIndex(trigger, edgeIndex);
        if (idx < 0) {
            const currentVertex = edge ? edge.tail : this.vertex;
            return new PathTree(this.graph, this.vertex, this.triggerEquality, this.childs.concat({
                index: edgeIndex,
                trigger: trigger,
                conditions: conditions,
                tree: new PathTree(this.graph, currentVertex, this.triggerEquality, this.childsFromPathElements(currentVertex, elements))
            }));
        }
        else {
            const newChilds = this.childs.concat();
            const existing = newChilds[idx];
            newChilds[idx] = {
                index: existing.index,
                trigger: existing.trigger,
                conditions: conditions ? (existing.conditions ? existing.conditions.merge(conditions) : conditions) : existing.conditions,
                tree: existing.tree.mergePathInternal(elements)
            };
            return new PathTree(this.graph, this.vertex, this.triggerEquality, newChilds);
        }
    }
    findIndex(trigger, edgeIndex) {
        for (let i = 0; i < this.childs.length; i++) {
            const child = this.childs[i];
            if (child.index === edgeIndex && this.triggerEquality(child.trigger, trigger)) {
                return i;
            }
        }
        return -1;
    }
    isAllInSameSubgraph() {
        return this.isAllInSameSubgraphInternal(this.vertex.source);
    }
    isAllInSameSubgraphInternal(target) {
        return this.vertex.source === target
            && this.childs.every(c => c.tree.isAllInSameSubgraphInternal(target));
    }
    toString(indent = "", includeConditions = false) {
        return this.toStringInternal(indent, includeConditions);
    }
    toStringInternal(indent, includeConditions) {
        if (this.isLeaf()) {
            return this.vertex.toString();
        }
        return this.vertex + ':\n' +
            this.childs.map(child => indent
                + ` -> [${child.index}] `
                + (includeConditions && child.conditions ? `!! {\n${indent + "  "}${child.conditions.toString(indent + "     ", true)}\n${indent} } ` : "")
                + `${child.trigger} = `
                + child.tree.toStringInternal(indent + "  ", includeConditions)).join('\n');
    }
}
exports.PathTree = PathTree;
function isRootPathTree(tree) {
    return (0, querygraph_1.isRootVertex)(tree.vertex);
}
exports.isRootPathTree = isRootPathTree;
function traversePathTree(pathTree, onEdges) {
    for (const [edge, _, conditions, childTree] of pathTree.childElements()) {
        if (edge) {
            onEdges(edge);
        }
        if (conditions) {
            traversePathTree(conditions, onEdges);
        }
        traversePathTree(childTree, onEdges);
    }
}
exports.traversePathTree = traversePathTree;
//# sourceMappingURL=pathTree.js.map