import {makeSchema, SchemaDefiner} from '../src';

type EnumMessage = {switcher: 'a' | 'b' | 'c'};
const EnumMessageSchema = makeSchema<EnumMessage>({
  switcher: {
    flag: 'enum',
    a: 0,
    b: 1,
    c: 2,
  },
});

test('enum test', () => {
  const generator = SchemaDefiner.generate<EnumMessage>(EnumMessageSchema);

  const buffer = SchemaDefiner.toBuffer({switcher: 'a'}, generator);
  expect(buffer.byteLength).toEqual(1);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.switcher).toEqual('a');
});
