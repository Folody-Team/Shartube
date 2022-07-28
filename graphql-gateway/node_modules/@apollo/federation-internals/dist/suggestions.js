"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.didYouMean = exports.suggestionList = void 0;
const js_levenshtein_1 = __importDefault(require("js-levenshtein"));
const utils_1 = require("./utils");
function suggestionList(input, options) {
    const optionsByDistance = new Map();
    const threshold = Math.floor(input.length * 0.4) + 1;
    const inputLowerCase = input.toLowerCase();
    for (const option of options) {
        const distance = inputLowerCase === option.toLowerCase()
            ? 1
            : (0, js_levenshtein_1.default)(input, option);
        if (distance <= threshold) {
            optionsByDistance.set(option, distance);
        }
    }
    return (0, utils_1.mapKeys)(optionsByDistance).sort((a, b) => {
        const distanceDiff = optionsByDistance.get(a) - optionsByDistance.get(b);
        return distanceDiff !== 0 ? distanceDiff : a.localeCompare(b);
    });
}
exports.suggestionList = suggestionList;
const MAX_SUGGESTIONS = 5;
function didYouMean(suggestions) {
    const message = ' Did you mean ';
    const quotedSuggestions = suggestions.map((x) => `"${x}"`);
    switch (suggestions.length) {
        case 0:
            return '';
        case 1:
            return message + quotedSuggestions[0] + '?';
        case 2:
            return message + quotedSuggestions[0] + ' or ' + quotedSuggestions[1] + '?';
    }
    const selected = quotedSuggestions.slice(0, MAX_SUGGESTIONS);
    const lastItem = selected.pop();
    return message + selected.join(', ') + ', or ' + lastItem + '?';
}
exports.didYouMean = didYouMean;
//# sourceMappingURL=suggestions.js.map