import {generateSchema, makeSchema} from '../src';

type EnumMessage = {switcher: 'a' | 'b' | 'c'};
const EnumMessageSchema = makeSchema<EnumMessage>({
  switcher: {
    flag: 'enum',
    a: 1,
    b: 2,
    c: 3,
  },
});

test('enum test', () => {
  const generator = generateSchema(EnumMessageSchema);

  const buffer = generator.toBuffer({switcher: 'a'});
  expect(buffer.byteLength).toEqual(1);

  const result = generator.fromBuffer(buffer);
  expect(result.switcher).toEqual('a');
});
