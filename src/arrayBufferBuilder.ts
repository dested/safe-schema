import {switchType} from './utils';

export class ArrayBufferBuilder {
  buffer: ArrayBuffer;
  curPosition = 0;
  view: DataView;
  constructor(initialBufferSize: number = 50, private sizeIsExact: boolean = false) {
    this.buffer = new ArrayBuffer(initialBufferSize);
    this.view = new DataView(this.buffer);
  }

  addBits(...bools: boolean[]) {
    this.addUint8(parseInt('1' + bools.map((a) => (a ? '1' : '0')).join(''), 2));
  }
  addBoolean(value: boolean) {
    !this.sizeIsExact && this.testSize(1);
    this.view.setUint8(this.curPosition, value ? 1 : 0);
    this.curPosition += 1;
  }

  addFloat32(value: number) {
    !this.sizeIsExact && this.testSize(4);
    this.view.setFloat32(this.curPosition, value);
    this.curPosition += 4;
  }

  addFloat64(value: number) {
    !this.sizeIsExact && this.testSize(8);
    this.view.setFloat64(this.curPosition, value);
    this.curPosition += 8;
  }

  addInt16(value: number) {
    !this.sizeIsExact && this.testSize(2);
    this.view.setInt16(this.curPosition, value);
    this.curPosition += 2;
  }

  addInt32(value: number) {
    !this.sizeIsExact && this.testSize(4);
    this.view.setInt32(this.curPosition, value);
    this.curPosition += 4;
  }

  addInt32Optional(value?: number) {
    if (value === undefined) {
      this.addInt32(-1);
    } else {
      this.addInt32(value);
    }
  }

  addInt8(value: number) {
    !this.sizeIsExact && this.testSize(1);
    this.view.setInt8(this.curPosition, value);
    this.curPosition += 1;
  }

  addInt8Optional(value?: number) {
    if (value === undefined) {
      this.addInt8(-1);
    } else {
      this.addInt8(value);
    }
  }
  addLoop<T>(items: T[], callback: (t: T) => void) {
    this.addUint16(items.length);
    for (const item of items) {
      callback(item);
    }
  }

  addString(str: string) {
    this.addUint16(str.length);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      this.addUint16(str.charCodeAt(i));
    }
  }

  addSwitch<TType extends string | number, TResult extends number>(n: TType, options: {[key in TType]: TResult}) {
    this.addUint8(switchType(n, options));
  }

  addUint16(value: number) {
    !this.sizeIsExact && this.testSize(2);
    this.view.setUint16(this.curPosition, value);
    this.curPosition += 2;
  }

  addUint32(value: number) {
    !this.sizeIsExact && this.testSize(4);
    this.view.setUint32(this.curPosition, value);
    this.curPosition += 4;
  }

  addUint8(value: number) {
    !this.sizeIsExact && this.testSize(1);
    this.view.setUint8(this.curPosition, value);
    this.curPosition += 1;
  }

  buildBuffer(): ArrayBuffer {
    return this.buffer.slice(0, this.curPosition);
  }

  testSize(added: number) {
    if (this.buffer.byteLength < this.curPosition + added) {
      this.buffer = transfer(this.buffer, this.buffer.byteLength * 4);
      this.view = new DataView(this.buffer);
    }
  }
}

export class ArrayBufferReader {
  private dv: DataView;
  private index: number;

  constructor(buffer: ArrayBuffer | ArrayBufferLike) {
    this.dv = new DataView(buffer);
    this.index = 0;
  }

  done() {
    if (this.index !== this.dv.byteLength) {
      throw new Error('Bad input size');
    }
  }

  loop<T>(callback: () => T, size: '16' | '8' = '16'): T[] {
    let len: number;
    switch (size) {
      case '16':
        len = this.readUint16();
        break;
      case '8':
        len = this.readUint8();
        break;
    }
    const items: T[] = [];
    for (let i = 0; i < len; i++) {
      items.push(callback());
    }
    return items;
  }

  readBits(): boolean[] {
    const int = this.readUint8();
    return int
      .toString(2)
      .split('')
      .map((a) => a === '1')
      .slice(1);
  }

  readBoolean() {
    return this.readUint8() === 1;
  }

  readFloat32(): number {
    const result = this.dv.getFloat32(this.index);
    this.index += 4;
    return result;
  }

  readFloat64(): number {
    const result = this.dv.getFloat64(this.index);
    this.index += 8;
    return result;
  }

  readInt16(): number {
    const result = this.dv.getInt16(this.index);
    this.index += 2;
    return result;
  }

  readInt32(): number {
    const result = this.dv.getInt32(this.index);
    this.index += 4;
    return result;
  }

  readInt32Optional(): number | undefined {
    const result = this.dv.getInt32(this.index);
    this.index += 4;
    if (result === -1) {
      return undefined;
    }
    return result;
  }

  readInt8(): number {
    const result = this.dv.getInt8(this.index);
    this.index += 1;
    return result;
  }
  readInt8Optional(): number | undefined {
    const result = this.dv.getInt8(this.index);
    this.index += 1;
    if (result === -1) {
      return undefined;
    }
    return result;
  }

  readString() {
    const len = this.readUint16();
    const strs: string[] = [];
    for (let i = 0; i < len; i++) {
      strs.push(String.fromCharCode(this.readUint16()));
    }
    return strs.join('');
  }

  readUint16(): number {
    const result = this.dv.getUint16(this.index);
    this.index += 2;
    return result;
  }

  readUint32(): number {
    const result = this.dv.getUint32(this.index);
    this.index += 4;
    return result;
  }

  readUint8(): number {
    const result = this.dv.getUint8(this.index);
    this.index += 1;
    return result;
  }

  switch<TOptions extends number, TResult>(callback: {[key in TOptions]: () => TResult}): TResult {
    const option = this.readUint8() as TOptions;
    if (callback[option] === undefined) {
      throw new Error(`'Type not found', ${option}`);
    }
    return callback[option]();
  }
}

const transfer =
  (ArrayBuffer as any).transfer ||
  ((source: ArrayBuffer, length: number) => {
    if (!(source instanceof ArrayBuffer)) {
      throw new TypeError('Source must be an instance of ArrayBuffer');
    }
    if (length <= source.byteLength) {
      return source.slice(0, length);
    }
    const sourceView = new Uint8Array(source);
    const destView = new Uint8Array(new ArrayBuffer(length));
    destView.set(sourceView);
    return destView.buffer;
  });
