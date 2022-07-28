"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachingConditionResolver = void 0;
const federation_internals_1 = require("@apollo/federation-internals");
const graphPath_1 = require("./graphPath");
const querygraph_1 = require("./querygraph");
function cachingConditionResolver(graph, resolver) {
    const cache = new querygraph_1.QueryGraphState(graph);
    return (edge, context, excludedEdges, excludedConditions) => {
        (0, federation_internals_1.assert)(edge.conditions, 'Should not have been called for edge without conditions');
        if (!context.isEmpty() || excludedConditions.length > 0) {
            return resolver(edge, context, excludedEdges, excludedConditions);
        }
        const cachedResolutionAndExcludedEdges = cache.getEdgeState(edge);
        if (cachedResolutionAndExcludedEdges) {
            const [cachedResolution, forExcludedEdges] = cachedResolutionAndExcludedEdges;
            return (0, graphPath_1.sameExcludedEdges)(forExcludedEdges, excludedEdges)
                ? cachedResolution
                : resolver(edge, context, excludedEdges, excludedConditions);
        }
        else {
            const resolution = resolver(edge, context, excludedEdges, excludedConditions);
            cache.setEdgeState(edge, [resolution, excludedEdges]);
            return resolution;
        }
    };
}
exports.cachingConditionResolver = cachingConditionResolver;
//# sourceMappingURL=conditionsCaching.js.map