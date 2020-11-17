import {makeSchema, SafeSchema, SchemaDefiner} from '../src';

type UInt8Message = {count?: number};
const UInt8MessageSchema = makeSchema<UInt8Message>({
  count: {
    flag: 'optional',
    element: 'uint8',
  },
});

test('uint8 optional test set', () => {
  const generator = SchemaDefiner.generate<UInt8Message>(UInt8MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: 12}, generator);
  expect(buffer.byteLength).toEqual(2);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(12);
});

test('uint8 optional test unset', () => {
  const generator = SchemaDefiner.generate<UInt8Message>(UInt8MessageSchema);

  const buffer = SchemaDefiner.toBuffer({count: undefined}, generator);
  expect(buffer.byteLength).toEqual(1);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.count).toEqual(undefined);
});
