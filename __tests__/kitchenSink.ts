import {SafeSchema, SchemaDefiner} from '../src';

type Weapons = 'sword' | 'laser';

type KitchenSinkMessage = {
  message: string;
  items: (
    | {
        type: 'weapon';
        strength: number;
        weapon: Weapons;
      }
    | {
        type: 'run';
        duration: number;
        direction: {
          up: boolean;
          down: boolean;
          left: boolean;
          right: boolean;
        };
      }
  )[];
};

const KitchenSinkMessageSchema: SafeSchema<KitchenSinkMessage> = {
  message: 'string',
  items: {
    flag: 'array-uint8',
    elements: {
      flag: 'type-lookup',
      elements: {
        run: {
          duration: 'uint16',
          direction: {
            flag: 'bitmask',
            up: 0,
            down: 1,
            left: 2,
            right: 3,
          },
        },
        weapon: {
          weapon: {
            flag: 'enum',
            laser: 0,
            sword: 1,
          },
          strength: 'float32',
        },
      },
    },
  },
};

test('kitchen sink test', () => {
  const generator = SchemaDefiner.generate<KitchenSinkMessage>(KitchenSinkMessageSchema);

  const buffer = SchemaDefiner.toBuffer(
    {
      message: 'The game is on!',
      items: [
        {type: 'weapon', strength: 12, weapon: 'sword'},
        {type: 'weapon', strength: 34, weapon: 'laser'},
        {type: 'run', duration: 45, direction: {down: true, left: false, right: true, up: false}},
      ],
    },
    generator
  );
  expect(buffer.byteLength).toEqual(49);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result).toEqual({
    message: 'The game is on!',
    items: [
      {type: 'weapon', strength: 12, weapon: 'sword'},
      {type: 'weapon', strength: 34, weapon: 'laser'},
      {type: 'run', duration: 45, direction: {down: true, left: false, right: true, up: false}},
    ],
  });
});
