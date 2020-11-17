import { CustomSchemaTypes, SafeSchema } from './schemaDefinerTypes';
import { ArrayBufferBuilder, ArrayBufferReader } from './arrayBufferBuilder';
export declare type SchemaGenerator<T, TCustom> = {
    readerFunction: ReaderFunction<T, TCustom>;
    adderFunction: AdderFunction<T, TCustom>;
    adderSizeFunction: AdderSizeFunction<T, TCustom>;
    customSchema: CustomSchemaTypes<TCustom>;
};
export declare class SchemaDefiner {
    static generateAdderFunction<T, TCustom>(schema: SafeSchema<T, keyof TCustom>, customSchema?: TCustom): AdderFunction<T, TCustom>;
    static generateAdderSizeFunction<T, TCustom>(schema: SafeSchema<T, keyof TCustom>, customSchema?: TCustom): AdderSizeFunction<T, TCustom>;
    static generateReaderFunction<T, TCustom>(schema: SafeSchema<T, keyof TCustom>, customSchema?: TCustom): ReaderFunction<T, TCustom>;
    static generate<T, TCustom = never>(schema: SafeSchema<T, keyof TCustom>, customSchema?: TCustom): SchemaGenerator<T, TCustom>;
    static toBuffer<T, TCustom>(value: T, generator: SchemaGenerator<T, TCustom>): ArrayBuffer;
    static fromBuffer<T, TCustom>(buffer: ArrayBuffer | ArrayBufferLike, generator: SchemaGenerator<T, TCustom>): T;
    private static buildAdderFunction;
    private static buildAdderSizeFunction;
    private static buildReaderFunction;
}
declare type AdderSizeFunction<T, TCustom> = (value: T, customSchemaTypes: CustomSchemaTypes<TCustom>) => number;
declare type AdderFunction<T, TCustom> = (buff: ArrayBufferBuilder, value: T, customSchemaTypes: CustomSchemaTypes<TCustom>) => ArrayBuffer;
declare type ReaderFunction<T, TCustom> = (reader: ArrayBufferReader, customSchemaTypes: CustomSchemaTypes<TCustom>) => T;
export declare function makeCustom<T>(t: CustomSchemaTypes<T>): CustomSchemaTypes<T>;
export declare function makeSchema<T, TCustom = never>(t: SafeSchema<T, keyof TCustom>): SafeSchema<T, keyof TCustom>;
export {};
//# sourceMappingURL=schemaDefiner.d.ts.map