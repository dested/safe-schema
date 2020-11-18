import {generateSchema, makeSchema} from '../src';

type UInt8Message = {count: number};
const UInt8MessageSchema = makeSchema<UInt8Message>({count: 'uint8'});

test('uint8 test', () => {
  const generator = generateSchema(UInt8MessageSchema);

  const buffer = generator.toBuffer({count: 12});
  expect(buffer.byteLength).toEqual(1);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(12);
});

type UInt16Message = {count: number};
const UInt16MessageSchema = makeSchema<UInt16Message>({count: 'uint16'});

test('uint16 test', () => {
  const generator = generateSchema(UInt16MessageSchema);

  const buffer = generator.toBuffer({count: 65530});
  expect(buffer.byteLength).toEqual(2);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(65530);
});

type UInt32Message = {count: number};
const UInt32MessageSchema = makeSchema<UInt32Message>({count: 'uint32'});

test('uint32 test', () => {
  const generator = generateSchema(UInt32MessageSchema);

  const buffer = generator.toBuffer({count: 123123123});
  expect(buffer.byteLength).toEqual(4);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(123123123);
});

type Int8Message = {count: number};
const Int8MessageSchema = makeSchema<Int8Message>({count: 'int8'});

test('int8 test', () => {
  const generator = generateSchema(Int8MessageSchema);

  const buffer = generator.toBuffer({count: 12});
  expect(buffer.byteLength).toEqual(1);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(12);
});

type Int16Message = {count: number};
const Int16MessageSchema = makeSchema<Int16Message>({count: 'int16'});

test('int16 test', () => {
  const generator = generateSchema(Int16MessageSchema);

  const buffer = generator.toBuffer({count: 25530});
  expect(buffer.byteLength).toEqual(2);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(25530);
});

type Int32Message = {count: number};
const Int32MessageSchema = makeSchema<Int32Message>({count: 'int32'});

test('int32 test', () => {
  const generator = generateSchema(Int32MessageSchema);

  const buffer = generator.toBuffer({count: 123123123});
  expect(buffer.byteLength).toEqual(4);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(123123123);
});

type Float32Message = {count: number};
const Float32MessageSchema = makeSchema<Float32Message>({count: 'float32'});

test('float32 test', () => {
  const generator = generateSchema(Float32MessageSchema);

  const buffer = generator.toBuffer({count: 12.34});
  expect(buffer.byteLength).toEqual(4);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toBeCloseTo(12.34);
});

type Float64Message = {count: number};
const Float64MessageSchema = makeSchema<Float64Message>({count: 'float64'});

test('float64 test', () => {
  const generator = generateSchema(Float64MessageSchema);

  const buffer = generator.toBuffer({count: 45.67});
  expect(buffer.byteLength).toEqual(8);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toBeCloseTo(45.67);
});

type BooleanMessage = {count: boolean};
const BooleanMessageSchema = makeSchema<BooleanMessage>({count: 'boolean'});

test('boolean test', () => {
  const generator = generateSchema(BooleanMessageSchema);

  const buffer = generator.toBuffer({count: true});
  expect(buffer.byteLength).toEqual(1);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(true);
});

type StringMessage = {count: string};
const StringMessageSchema = makeSchema<StringMessage>({count: 'string'});

test('string test', () => {
  const generator = generateSchema(StringMessageSchema);

  const buffer = generator.toBuffer({count: 'Hi, how are you?'});
  expect(buffer.byteLength).toEqual('Hi, how are you?'.length * 2 + 2);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual('Hi, how are you?');
});
