export declare function newDebugLogger(name: string): DebugLogger;
export declare class DebugLogger {
    readonly name: string;
    readonly enabled: boolean;
    private header;
    constructor(name: string, enabled: boolean);
    private updateHeader;
    private doLog;
    log(message: string | (() => string), prefix?: string): DebugLogger;
    groupedValues<T>(values: T[], printFn: (v: T) => string, initialMessage?: string): DebugLogger;
    groupedEntries<K, V>(map: Map<K, V>, keyPrintFn: (k: K) => string, valuePrintFn: (v: V) => string): DebugLogger;
    group(openingMessage?: string | (() => string)): DebugLogger;
    groupEnd(closingMessage?: string | (() => string)): DebugLogger;
}
//# sourceMappingURL=debug.d.ts.map