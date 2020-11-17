import {SafeSchema, SchemaDefiner} from '../src';

type UInt8Message = {count: number};
const UInt8MessageSchema: SafeSchema<UInt8Message> = {count: 'uint8'};

test('uint8 test', () => {
  const generator = SchemaDefiner.generate<UInt8Message>(UInt8MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 12}, generator);
  expect(buffer.byteLength).toEqual(1);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(12);
});

type UInt16Message = {count: number};
const UInt16MessageSchema: SafeSchema<UInt16Message> = {count: 'uint16'};

test('uint16 test', () => {
  const generator = SchemaDefiner.generate<UInt16Message>(UInt16MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 65530}, generator);
  expect(buffer.byteLength).toEqual(2);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(65530);
});

type UInt32Message = {count: number};
const UInt32MessageSchema: SafeSchema<UInt32Message> = {count: 'uint32'};

test('uint32 test', () => {
  const generator = SchemaDefiner.generate<UInt32Message>(UInt32MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 123123123}, generator);
  expect(buffer.byteLength).toEqual(4);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(123123123);
});

type Int8Message = {count: number};
const Int8MessageSchema: SafeSchema<Int8Message> = {count: 'int8'};

test('int8 test', () => {
  const generator = SchemaDefiner.generate<Int8Message>(Int8MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 12}, generator);
  expect(buffer.byteLength).toEqual(1);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(12);
});

type Int16Message = {count: number};
const Int16MessageSchema: SafeSchema<Int16Message> = {count: 'int16'};

test('int16 test', () => {
  const generator = SchemaDefiner.generate<Int16Message>(Int16MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 25530}, generator);
  expect(buffer.byteLength).toEqual(2);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(25530);
});

type Int32Message = {count: number};
const Int32MessageSchema: SafeSchema<Int32Message> = {count: 'int32'};

test('int32 test', () => {
  const generator = SchemaDefiner.generate<Int32Message>(Int32MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 123123123}, generator);
  expect(buffer.byteLength).toEqual(4);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(123123123);
});

type Float32Message = {count: number};
const Float32MessageSchema: SafeSchema<Float32Message> = {count: 'float32'};

test('float32 test', () => {
  const generator = SchemaDefiner.generate<Float32Message>(Float32MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 12.34}, generator);
  expect(buffer.byteLength).toEqual(4);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toBeCloseTo(12.34);
});

type Float64Message = {count: number};
const Float64MessageSchema: SafeSchema<Float64Message> = {count: 'float64'};

test('float64 test', () => {
  const generator = SchemaDefiner.generate<Float64Message>(Float64MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 45.67}, generator);
  expect(buffer.byteLength).toEqual(8);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toBeCloseTo(45.67);
});

type BooleanMessage = {count: boolean};
const BooleanMessageSchema: SafeSchema<BooleanMessage> = {count: 'boolean'};

test('boolean test', () => {
  const generator = SchemaDefiner.generate<BooleanMessage>(BooleanMessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: true}, generator);
  expect(buffer.byteLength).toEqual(1);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(true);
});

type StringMessage = {count: string};
const StringMessageSchema: SafeSchema<StringMessage> = {count: 'string'};

test('string test', () => {
  const generator = SchemaDefiner.generate<StringMessage>(StringMessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 'Hi, how are you?'}, generator);
  expect(buffer.byteLength).toEqual('Hi, how are you?'.length * 2 + 2);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual('Hi, how are you?');
});
