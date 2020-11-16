export declare function objectSafeKeys<T>(obj: T): (keyof T)[];
export declare function assert(assertion: boolean): asserts assertion;
export declare function assertType<T>(assertion: any): asserts assertion is T;
export declare function safeKeysExclude<T, TExclude extends keyof T>(obj: T, exclude: TExclude): Exclude<keyof T, TExclude>[];
export declare function switchType<TType extends string | number, TResult>(n: TType, options: {
    [key in TType]: TResult;
}): TResult;
//# sourceMappingURL=utils.d.ts.map