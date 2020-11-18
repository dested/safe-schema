import {generateSchema, makeCustomSchema, makeSchema} from '../src';

type CustomTypeMessage = {testId: string};

export const customSchemaTypes = makeCustomSchema({
  specialId: {
    read: (buffer): string => buffer.readInt16() + '-' + buffer.readInt16(),
    write: (model: string, buffer) => {
      const specialIdParse = /(-?\d*)-(-?\d*)/;
      const specialIdResult = specialIdParse.exec(model);
      const x = parseInt(specialIdResult[1]);
      const y = parseInt(specialIdResult[2]);
      buffer.addInt16(x);
      buffer.addInt16(y);
    },
    size: (model: string) => 2 + 2,
  },
});

const CustomTypeMessageSchema = makeSchema<CustomTypeMessage, typeof customSchemaTypes>({testId: 'specialId'});

test('custom type test', () => {
  const generator = generateSchema(CustomTypeMessageSchema, customSchemaTypes);

  const buffer = generator.toBuffer({testId: '12345-12344'});
  expect(buffer.byteLength).toEqual(4);

  const result = generator.fromBuffer(buffer);
  expect(result.testId).toEqual('12345-12344');
});
