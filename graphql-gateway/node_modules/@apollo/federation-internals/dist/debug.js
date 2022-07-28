"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugLogger = exports.newDebugLogger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("./utils");
function indentString(indentLevel) {
    let str = "";
    for (let i = 0; i < indentLevel; i++) {
        str += chalk_1.default.blackBright("⎸ ");
    }
    return str;
}
function isEnabled(name) {
    const v = process.env.APOLLO_FEDERATION_DEBUG;
    const bool = (0, utils_1.validateStringContainsBoolean)(v);
    if (bool !== undefined) {
        return bool;
    }
    const enabledNames = v.split(',').map(n => n.trim());
    return enabledNames.includes(name);
}
let currentIndentLevel = 0;
let currentIndentation = '';
let maxLoggerNameLength = 0;
const createdLoggers = [];
function newDebugLogger(name) {
    const enabled = isEnabled(name);
    const created = new DebugLogger(name, enabled);
    if (enabled) {
        global.console = require('console');
        createdLoggers.push(created);
        maxLoggerNameLength = Math.max(maxLoggerNameLength, name.length);
        for (const logger of createdLoggers) {
            DebugLogger.prototype['updateHeader'].call(logger, maxLoggerNameLength);
        }
    }
    return created;
}
exports.newDebugLogger = newDebugLogger;
function increaseIndentation() {
    currentIndentLevel++;
    currentIndentation = indentString(currentIndentLevel);
}
function decreaseIndentation() {
    if (currentIndentLevel > 0) {
        currentIndentLevel--;
        currentIndentation = indentString(currentIndentLevel);
    }
}
class DebugLogger {
    constructor(name, enabled) {
        this.name = name;
        this.enabled = enabled;
        this.header = chalk_1.default.blackBright(`[${name}] `);
    }
    updateHeader(maxLength) {
        let padding = "";
        if (maxLength > this.name.length) {
            const toPad = maxLength - this.name.length;
            for (let i = 0; i < toPad; i++) {
                padding += " ";
            }
        }
        this.header = chalk_1.default.blackBright('[' + padding + this.name + '] ');
    }
    doLog(str) {
        const indent = this.header + currentIndentation;
        const withIndentedNewlines = str.replace(/\n/g, '\n' + indent + '  ');
        console.log(indent + withIndentedNewlines);
    }
    log(message, prefix = chalk_1.default.yellow('• ')) {
        if (!this.enabled)
            return this;
        if (typeof message !== 'string') {
            message = message();
        }
        this.doLog(prefix + message);
        return this;
    }
    groupedValues(values, printFn, initialMessage) {
        if (!this.enabled)
            return this;
        this.group(initialMessage);
        for (const value of values) {
            this.doLog('- ' + printFn(value));
        }
        return this.groupEnd();
    }
    groupedEntries(map, keyPrintFn, valuePrintFn) {
        if (!this.enabled)
            return this;
        this.group();
        for (const [k, v] of map.entries()) {
            this.doLog('- ' + keyPrintFn(k) + ': ' + valuePrintFn(v));
        }
        return this.groupEnd();
    }
    group(openingMessage) {
        if (this.enabled) {
            if (openingMessage) {
                this.log(openingMessage, chalk_1.default.blue('‣ '));
            }
            increaseIndentation();
        }
        return this;
    }
    groupEnd(closingMessage) {
        if (!this.enabled) {
            return this;
        }
        decreaseIndentation();
        if (closingMessage) {
            this.log(closingMessage, chalk_1.default.green('⇒ '));
        }
        return this;
    }
}
exports.DebugLogger = DebugLogger;
//# sourceMappingURL=debug.js.map