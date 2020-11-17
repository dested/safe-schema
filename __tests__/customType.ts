import {makeCustom, makeSchema, SchemaDefiner} from '../src';
type CustomTypeMessage = {testId: string};

export const customSchemaTypes = makeCustom<{specialId: string}>({
  specialId: {
    read: (buffer) => buffer.readInt16() + '-' + buffer.readInt16(),
    write: (model, buffer) => {
      const specialIdParse = /(-?\d*)-(-?\d*)/;
      const specialIdResult = specialIdParse.exec(model);
      const x = parseInt(specialIdResult[1]);
      const y = parseInt(specialIdResult[2]);
      buffer.addInt16(x);
      buffer.addInt16(y);
    },
    size: (model) => 2 + 2,
  },
});

// const CustomTypeMessageSchema: SafeSchema<CustomTypeMessage, keyof typeof customSchemaTypes> = {testId: 'specialId'};
const CustomTypeMessageSchema = makeSchema<CustomTypeMessage, typeof customSchemaTypes>({testId: 'specialId'});

test('custom type test', () => {
  const generator = SchemaDefiner.generate<CustomTypeMessage, typeof customSchemaTypes>(
    CustomTypeMessageSchema,
    customSchemaTypes
  );

  const buffer = SchemaDefiner.toBuffer({testId: '12345-12344'}, generator);
  expect(buffer.byteLength).toEqual(4);

  const result = SchemaDefiner.fromBuffer(buffer, generator);
  expect(result.testId).toEqual('12345-12344');
});
