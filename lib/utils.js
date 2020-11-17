"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchType = exports.safeKeysExclude = exports.assertType = exports.assert = exports.objectSafeKeys = void 0;
function objectSafeKeys(obj) {
    return Object.keys(obj);
}
exports.objectSafeKeys = objectSafeKeys;
function assert(assertion) { }
exports.assert = assert;
function assertType(assertion) { }
exports.assertType = assertType;
function safeKeysExclude(obj, exclude) {
    return Object.keys(obj).filter((key) => key !== exclude);
}
exports.safeKeysExclude = safeKeysExclude;
function switchType(n, options) {
    if (options[n] === undefined) {
        throw new Error(`'Type not found', ${n}, ${JSON.stringify(options)}`);
    }
    return options[n];
}
exports.switchType = switchType;
//# sourceMappingURL=utils.js.map