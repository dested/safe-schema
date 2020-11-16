import { ArrayBufferBuilder, ArrayBufferReader } from './arrayBufferBuilder';
export declare class SchemaDefiner {
    static generateAdderFunction(schema: any): any;
    static generateAdderSizeFunction(schema: any): any;
    static generateReaderFunction(schema: any): any;
    static startAddSchemaBuffer(value: any, adderSizeFunction: (value: any) => number, adderFunction: (buff: ArrayBufferBuilder, value: any) => ArrayBuffer): ArrayBuffer;
    static startReadSchemaBuffer(buffer: ArrayBuffer | ArrayBufferLike, readerFunction: (reader: ArrayBufferReader) => any): any;
    private static buildAdderFunction;
    private static buildAdderSizeFunction;
    private static buildReaderFunction;
}
//# sourceMappingURL=schemaDefiner.d.ts.map