import {generateSchema, makeSchema} from '../src';

type Uint8ArrayMessage = {count: number[]};
const Uint8ArrayMessageSchema = makeSchema<Uint8ArrayMessage>({
  count: {
    flag: 'array-uint8',
    elements: 'uint32',
  },
});

test('array unit8 test', () => {
  const generator = generateSchema(Uint8ArrayMessageSchema);

  const buffer = generator.toBuffer({count: [12, 24]});
  expect(buffer.byteLength).toEqual(4 * 2 + 1);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual([12, 24]);
});

type Uint16ArrayMessage = {count: number[]};
const Uint16ArrayMessageSchema = makeSchema<Uint16ArrayMessage>({
  count: {
    flag: 'array-uint16',
    elements: 'uint32',
  },
});

test('array unit8 test', () => {
  const generator = generateSchema(Uint16ArrayMessageSchema);

  const buffer = generator.toBuffer({count: [12, 24]});
  expect(buffer.byteLength).toEqual(4 * 2 + 2);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual([12, 24]);
});

type Uint8ArrayObjectMessage = {count: {shoes: boolean; count: number}[]};
const Uint8ArrayObjectMessageSchema = makeSchema<Uint8ArrayObjectMessage>({
  count: {
    flag: 'array-uint8',
    elements: {
      count: 'uint8',
      shoes: 'boolean',
    },
  },
});

test('array unit8 object test', () => {
  const generator = generateSchema(Uint8ArrayObjectMessageSchema);

  const buffer = generator.toBuffer({
    count: [
      {shoes: true, count: 12},
      {shoes: false, count: 34},
    ],
  });
  expect(buffer.byteLength).toEqual((1 + 1) * 2 + 1);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual([
    {shoes: true, count: 12},
    {shoes: false, count: 34},
  ]);
});
