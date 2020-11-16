import { SafeSchema } from './schemaDefinerTypes';
import { ArrayBufferBuilder, ArrayBufferReader } from './arrayBufferBuilder';
export declare type SchemaGenerator<T> = {
    readerFunction: (reader: ArrayBufferReader) => T;
    adderFunction: (buff: ArrayBufferBuilder, value: T) => ArrayBuffer;
    adderSizeFunction: (value: T) => number;
};
export declare class SchemaDefiner {
    static generateAdderFunction(schema: any): any;
    static generateAdderSizeFunction(schema: any): any;
    static generateReaderFunction(schema: any): any;
    static generate<T>(schema: SafeSchema<T>): SchemaGenerator<T>;
    static toBuffer<T>(value: T, generator: SchemaGenerator<T>): ArrayBuffer;
    static fromBuffer<T>(buffer: ArrayBuffer | ArrayBufferLike, generator: SchemaGenerator<T>): T;
    private static buildAdderFunction;
    private static buildAdderSizeFunction;
    private static buildReaderFunction;
}
//# sourceMappingURL=schemaDefiner.d.ts.map