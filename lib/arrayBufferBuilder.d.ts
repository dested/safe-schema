export declare class ArrayBufferBuilder {
    private sizeIsExact;
    buffer: ArrayBuffer;
    curPosition: number;
    view: DataView;
    constructor(initialBufferSize?: number, sizeIsExact?: boolean);
    addBits(...bools: boolean[]): void;
    addBoolean(value: boolean): void;
    addFloat32(value: number): void;
    addFloat64(value: number): void;
    addInt16(value: number): void;
    addInt32(value: number): void;
    addInt32Optional(value?: number): void;
    addInt8(value: number): void;
    addInt8Optional(value?: number): void;
    addLoop<T>(items: T[], callback: (t: T) => void): void;
    addString(str: string): void;
    addArrayBuffer(buff: ArrayBuffer): void;
    addSwitch<TType extends string | number, TResult extends number>(n: TType, options: {
        [key in TType]: TResult;
    }): void;
    addUint16(value: number): void;
    addUint32(value: number): void;
    addUint8(value: number): void;
    buildBuffer(): ArrayBuffer;
    testSize(added: number): void;
}
export declare class ArrayBufferReader {
    private dv;
    private index;
    constructor(buffer: ArrayBuffer | ArrayBufferLike);
    done(): void;
    loop<T>(callback: () => T, size?: '16' | '8'): T[];
    readBits(): boolean[];
    readBoolean(): boolean;
    readFloat32(): number;
    readFloat64(): number;
    readInt16(): number;
    readInt32(): number;
    readInt32Optional(): number | undefined;
    readInt8(): number;
    readInt8Optional(): number | undefined;
    readArrayBuffer(): ArrayBuffer;
    readString(): string;
    readUint16(): number;
    readUint32(): number;
    readUint8(): number;
    switch<TOptions extends number, TResult>(callback: {
        [key in TOptions]: () => TResult;
    }): TResult;
}
//# sourceMappingURL=arrayBufferBuilder.d.ts.map