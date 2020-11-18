import {generateSchema, makeSchema} from '../src';

type BitMaskMessage = {
  switcher: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
};
const BitMaskMessageSchema = makeSchema<BitMaskMessage>({
  switcher: {
    flag: 'bitmask',
    up: 0,
    down: 1,
    left: 2,
    right: 3,
  },
});

test('bitmask test', () => {
  const generator = generateSchema(BitMaskMessageSchema);

  const buffer = generator.toBuffer({switcher: {left: true, down: false, up: true, right: false}});

  expect(buffer.byteLength).toEqual(1);

  const result = generator.fromBuffer(buffer);
  expect(result.switcher).toEqual({left: true, down: false, up: true, right: false});
});
