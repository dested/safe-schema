import {makeSchema, SafeSchema, SchemaDefiner} from '../src';
import {assertType} from '../src/utils';

type Messages =
  | {
      type: 'ping';
      value: number;
    }
  | {
      type: 'pong';
      shoes: number;
    };

const MessageSchema = makeSchema<Messages>({
  flag: 'type-lookup',
  elements: {
    ping: {value: 'uint8'},
    pong: {shoes: 'float32'},
  },
});

test('type lookup test', () => {
  const generator = SchemaDefiner.generate<Messages>(MessageSchema);

  const buffer = SchemaDefiner.toBuffer({type: 'pong', shoes: 12}, generator);

  expect(buffer.byteLength).toEqual(5);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.type).toEqual('pong');
  assertType<'pong'>(result.type);
  expect(result.shoes).toEqual(12);
});
