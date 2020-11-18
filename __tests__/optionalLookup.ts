import {generateSchema, makeSchema} from '../src';

type UInt8Message = {count?: number};
const UInt8MessageSchema = makeSchema<UInt8Message>({
  count: {
    flag: 'optional',
    element: 'uint8',
  },
});

test('uint8 optional test set', () => {
  const generator = generateSchema(UInt8MessageSchema);

  const buffer = generator.toBuffer({count: 12});
  expect(buffer.byteLength).toEqual(2);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(12);
});

test('uint8 optional test unset', () => {
  const generator = generateSchema(UInt8MessageSchema);

  const buffer = generator.toBuffer({count: undefined});
  expect(buffer.byteLength).toEqual(1);

  const result = generator.fromBuffer(buffer);
  expect(result.count).toEqual(undefined);
});
