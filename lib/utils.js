export function objectSafeKeys(obj) {
    return Object.keys(obj);
}
export function assert(assertion) { }
export function assertType(assertion) { }
export function safeKeysExclude(obj, exclude) {
    return Object.keys(obj).filter((key) => key !== exclude);
}
export function switchType(n, options) {
    if (options[n] === undefined) {
        throw new Error(`'Type not found', ${n}, ${JSON.stringify(options)}`);
    }
    return options[n];
}
//# sourceMappingURL=utils.js.map