import {generateSchema, makeSchema} from '../src';
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
  const generator = generateSchema<Messages>(MessageSchema);

  const buffer = generator.toBuffer({type: 'pong', shoes: 12});

  expect(buffer.byteLength).toEqual(5);

  const result = generator.fromBuffer(buffer);
  expect(result.type).toEqual('pong');
  assertType<'pong'>(result.type);
  expect(result.shoes).toEqual(12);
});
