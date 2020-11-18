import { CustomSchemaTypes, SafeSchema } from './schemaDefinerTypes';
export declare function generateSchema<T, TCustom = never>(schema: SafeSchema<T, TCustom>, customSchema?: TCustom): {
    toBuffer: (value: T) => ArrayBuffer;
    fromBuffer: (value: ArrayBuffer | ArrayBufferLike) => T;
};
export declare function makeCustomSchema<T>(t: CustomSchemaTypes<T>): CustomSchemaTypes<T>;
export declare function makeSchema<T, TCustom = CustomSchemaTypes<never>>(t: SafeSchema<T, TCustom>): SafeSchema<T, TCustom>;
//# sourceMappingURL=schemaDefiner.d.ts.map