import {makeSchema, SchemaDefiner} from '../src';

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
  const generator = SchemaDefiner.generate<BitMaskMessage>(BitMaskMessageSchema);

  const buffer = SchemaDefiner.toBuffer({switcher: {left: true, down: false, up: true, right: false}}, generator);

  expect(buffer.byteLength).toEqual(1);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.switcher).toEqual({left: true, down: false, up: true, right: false});
});
