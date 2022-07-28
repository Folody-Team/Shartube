"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickHighlights = exports.groupToDot = exports.toDot = void 0;
const querygraph_1 = require("./querygraph");
const ts_graphviz_1 = require("ts-graphviz");
const graphPath_1 = require("./graphPath");
function setDefaultGraphAttributes(_) {
}
function toDot(graph, config) {
    const vizGraph = (0, ts_graphviz_1.digraph)(graph.name);
    setDefaultGraphAttributes(vizGraph);
    addToVizGraphAndHighlight(graph, vizGraph, config);
    return (0, ts_graphviz_1.toDot)(vizGraph);
}
exports.toDot = toDot;
function groupToDot(name, graphs, configs = new Map()) {
    const vizGraph = (0, ts_graphviz_1.digraph)(name);
    setDefaultGraphAttributes(vizGraph);
    for (const [group, graph] of graphs.entries()) {
        const cluster = vizGraph.createSubgraph(`cluster_${group}`, {
            [ts_graphviz_1.attribute.label]: `${group}`,
            [ts_graphviz_1.attribute.style]: "filled",
            [ts_graphviz_1.attribute.color]: "grey95"
        });
        addToVizGraphAndHighlight(graph, cluster, configs.get(group));
    }
    return (0, ts_graphviz_1.toDot)(vizGraph);
}
exports.groupToDot = groupToDot;
function addToVizGraphAndHighlight(graph, vizGraph, config) {
    const state = addToVizGraph(graph, vizGraph, config === null || config === void 0 ? void 0 : config.noTerminal);
    highlightPaths(state, config === null || config === void 0 ? void 0 : config.highlightedPaths);
}
const colors = [
    'blue',
    'darkgreen',
    'red',
    'yellow',
    'orange',
    'lightseagreen'
];
function pickHighlights(paths, excluded = []) {
    const usableColors = colors.filter(c => !excluded.includes(c));
    return paths.map((path, i) => { return { path, color: usableColors[i % usableColors.length] }; });
}
exports.pickHighlights = pickHighlights;
function addToVizGraph(graph, vizGraph, noTerminal = false) {
    const vizSubGraphs = new Map();
    for (const source of graph.sources.keys()) {
        if (source != graph.name) {
            vizSubGraphs.set(source, vizGraph.createSubgraph(`cluster_${source}`, {
                [ts_graphviz_1.attribute.label]: `Subgraph "${source}"`,
                [ts_graphviz_1.attribute.color]: "black",
                [ts_graphviz_1.attribute.style]: ""
            }));
        }
    }
    const getNode = function (vertex) {
        const existingNode = state.getVertexState(vertex);
        if (existingNode) {
            return existingNode;
        }
        let newNode;
        if (vertex.source == graph.name) {
            newNode = vizGraph.createNode(vertex.type.name);
        }
        else {
            const vizSubGraph = vizSubGraphs.get(vertex.source);
            newNode = vizSubGraph.createNode(`${vertex.type.name}@${vertex.source}`);
        }
        state.setVertexState(vertex, newNode);
        return newNode;
    };
    const pickGraphForEdge = function (head, tail) {
        if (head.source == tail.source && head.source != graph.name) {
            return vizSubGraphs.get(head.source);
        }
        return vizGraph;
    };
    const state = new querygraph_1.QueryGraphState(graph);
    const onEdge = function (edge) {
        const head = edge.head;
        const tail = edge.tail;
        if (noTerminal && graph.isTerminal(tail)) {
            return false;
        }
        const headNode = getNode(head);
        const tailNode = getNode(tail);
        const attributes = {
            [ts_graphviz_1.attribute.label]: edge.label(),
        };
        state.setEdgeState(edge, pickGraphForEdge(head, tail).createEdge([headNode, tailNode], attributes));
        return true;
    };
    (0, querygraph_1.simpleTraversal)(graph, _ => undefined, onEdge);
    return state;
}
function highlightPaths(state, toHighlights) {
    toHighlights === null || toHighlights === void 0 ? void 0 : toHighlights.forEach(h => highlightPath(state, h));
}
function highlightPath(state, toHighlight) {
    (0, graphPath_1.traversePath)(toHighlight.path, e => {
        var _a, _b, _c;
        for (const vAttrs of [(_a = state.getVertexState(e.head)) === null || _a === void 0 ? void 0 : _a.attributes, (_b = state.getVertexState(e.tail)) === null || _b === void 0 ? void 0 : _b.attributes]) {
            vAttrs === null || vAttrs === void 0 ? void 0 : vAttrs.set(ts_graphviz_1.attribute.color, toHighlight.color);
            vAttrs === null || vAttrs === void 0 ? void 0 : vAttrs.set(ts_graphviz_1.attribute.fontcolor, toHighlight.color);
        }
        const eAttrs = (_c = state.getEdgeState(e)) === null || _c === void 0 ? void 0 : _c.attributes;
        eAttrs === null || eAttrs === void 0 ? void 0 : eAttrs.set(ts_graphviz_1.attribute.color, toHighlight.color);
        eAttrs === null || eAttrs === void 0 ? void 0 : eAttrs.set(ts_graphviz_1.attribute.fontcolor, toHighlight.color);
    });
}
//# sourceMappingURL=graphviz.js.map