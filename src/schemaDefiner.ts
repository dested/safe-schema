import {ABFlags, ABSchemaDef, CustomSchemaTypes, SafeSchema} from './schemaDefinerTypes';
import {assertType, safeKeysExclude} from './utils';
import {ArrayBufferBuilder, ArrayBufferReader} from './arrayBufferBuilder';

type SchemaGenerator<T, TCustom> = {
  readerFunction: ReaderFunction<T, TCustom>;
  adderFunction: AdderFunction<T, TCustom>;
  adderSizeFunction: AdderSizeFunction<T, TCustom>;
  customSchema: CustomSchemaTypes<TCustom>;
};

function generateAdderFunction<T, TCustom>(
  schema: SafeSchema<T, TCustom>,
  customSchema: TCustom = {} as any
): AdderFunction<T, TCustom> {
  const objectMaps: string[] = [];

  let code = buildAdderFunction(
    schema as any,
    'value',
    (map) => {
      const id = objectMaps.length;
      objectMaps.push(`const map${id}=${map}`);
      return `map${id}`;
    },
    customSchema as any
  );

  // language=JavaScript
  code = `
(buff, value,customSchema)=>{
${objectMaps.join(';\n')}
${code}
return buff.buildBuffer()
}`;
  // tslint:disable no-eval
  return eval(code);
}
function generateAdderSizeFunction<T, TCustom>(
  schema: SafeSchema<T, TCustom>,
  customSchema: TCustom = {} as any
): AdderSizeFunction<T, TCustom> {
  const objectMaps: string[] = [];
  let code = buildAdderSizeFunction(
    schema as any,
    'value',
    (map) => {
      const id = objectMaps.length;
      objectMaps.push(`const map${id}=${map}`);
      return `map${id}`;
    },
    customSchema as any
  );

  // language=JavaScript
  code = `
var sum=(items)=>{
  let c=0;
  for (let i = 0; i < items.length; i++) {
    c+=items[i];
  }
  return c;
};
(value,customSchema)=>{
${objectMaps.join(';\n')}
return (${code}0);
}`;
  // tslint:disable no-eval
  return eval(code);
}

function generateReaderFunction<T, TCustom>(
  schema: SafeSchema<T, TCustom>,
  customSchema: TCustom = {} as any
): ReaderFunction<T, TCustom> {
  const objectMaps: string[] = [];

  let code = buildReaderFunction(
    schema as any,
    (map) => {
      const id = objectMaps.length;
      objectMaps.push(`const map${id}=${map}`);
      return `map${id}`;
    },
    customSchema as any
  );

  // language=JavaScript
  code = `
      function range(len, callback) {
        let items = [];
        for (let i = 0; i < len; i++) {
          items.push(callback());
        }
        return items;
      }
      function lookup(id, obj) {
        return obj[id]();
      }
      function lookupEnum(id, obj) {
        return obj[id];
      }
      function bitmask(mask, obj) {
        const result = {};
        for (let i = 0; i < mask.length; i++) {
          result[obj[i]] = !!mask[i];
        }
        return result;
      }

      (reader,customSchema)=>{
        ${objectMaps.join(';\n')}
        return (${code})
      }`;
  // tslint:disable no-eval
  return eval(code);
}

export function generateSchema<T, TCustom = never>(
  schema: SafeSchema<T, TCustom>,
  customSchema?: TCustom
): {toBuffer: (value: T) => ArrayBuffer; fromBuffer: (value: ArrayBuffer | ArrayBufferLike) => T} {
  const readerFunction = generateReaderFunction<T, TCustom>(schema, customSchema);
  const adderFunction = generateAdderFunction<T, TCustom>(schema, customSchema);
  const adderSizeFunction = generateAdderSizeFunction<T, TCustom>(schema, customSchema);

  let generator = {
    readerFunction,
    adderFunction,
    adderSizeFunction,
    customSchema: customSchema ?? ({} as any),
  };
  return {
    toBuffer: (value: T) => {
      return toBuffer(value, generator);
    },
    fromBuffer: (value: ArrayBuffer | ArrayBufferLike) => {
      return fromBuffer(value, generator);
    },
  };
}

function toBuffer<T, TCustom>(value: T, generator: SchemaGenerator<T, TCustom>) {
  const size = generator.adderSizeFunction(value, generator.customSchema);
  const arrayBufferBuilder = new ArrayBufferBuilder(size, true);
  return generator.adderFunction(arrayBufferBuilder, value, generator.customSchema);
}

function fromBuffer<T, TCustom>(buffer: ArrayBuffer | ArrayBufferLike, generator: SchemaGenerator<T, TCustom>): T {
  return generator.readerFunction(new ArrayBufferReader(buffer), generator.customSchema);
}

function buildAdderFunction(
  schema: ABSchemaDef,
  fieldName: string,
  addMap: (code: string) => string,
  customSchema: CustomSchemaTypes<any>
): string {
  if (typeof schema === 'string' && customSchema[schema]) {
    return `customSchema['${schema}'].write(${fieldName},buff);\n`;
  }

  switch (schema) {
    case 'uint8':
      return `buff.addUint8(${fieldName});\n`;
    case 'uint16':
      return `buff.addUint16(${fieldName});\n`;
    case 'uint32':
      return `buff.addUint32(${fieldName});\n`;
    case 'int8':
      return `buff.addInt8(${fieldName});\n`;
    case 'int16':
      return `buff.addInt16(${fieldName});\n`;
    case 'int32':
      return `buff.addInt32(${fieldName});\n`;
    case 'float32':
      return `buff.addFloat32(${fieldName});\n`;
    case 'float64':
      return `buff.addFloat64(${fieldName});\n`;
    case 'boolean':
      return `buff.addBoolean(${fieldName});\n`;
    case 'string':
      return `buff.addString(${fieldName});\n`;
    default:
      assertType<ABFlags>(schema);
      switch (schema.flag) {
        case 'enum': {
          return `switch(${fieldName}){
          ${safeKeysExclude(schema, 'flag')
            .map((key) => `case '${key}':buff.addUint8(${schema[key]});break;`)
            .join('\n')}
          }`;
        }
        case 'number-enum': {
          return `switch(${fieldName}){
          ${safeKeysExclude(schema, 'flag')
            .map((key) => `case ${key}:buff.addUint8(${schema[key]});break;`)
            .join('\n')}
          }`;
        }
        case 'bitmask': {
          return `buff.addBits(...[
${safeKeysExclude(schema, 'flag')
  .map((key) => `${fieldName}['${key}'],`)
  .join('\n')}
]);`;
        }

        case 'array-uint8': {
          const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
          return `
           buff.addUint8(${fieldName}.length);
    for (const ${noPeriodsFieldName}Element of ${fieldName}) {
      ${buildAdderFunction(schema.elements, noPeriodsFieldName + 'Element', addMap, customSchema)}
    }`;
        }
        case 'array-uint16': {
          const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
          return `
           buff.addUint16(${fieldName}.length);
    for (const ${noPeriodsFieldName}Element of ${fieldName}) {
      ${buildAdderFunction(schema.elements, noPeriodsFieldName + 'Element', addMap, customSchema)}
    }`;
        }
        case 'type-lookup': {
          return `switch(${fieldName}.type){
          ${Object.keys(schema.elements)
            .map(
              (key, index) =>
                `case '${key}':{
                buff.addUint8(${index});
                ${buildAdderFunction(schema.elements[key], fieldName, addMap, customSchema)};
                break;
                }`
            )
            .join('\n')}
          }`;
        }
        case 'optional': {
          return `buff.addBoolean(${fieldName}!==undefined);
            if(${fieldName}!==undefined){
            ${buildAdderFunction(schema.element, fieldName, addMap, customSchema)}
            }`;
        }
        case undefined:
          assertType<{flag: undefined} & {[key: string]: any}>(schema);
          let result = '';
          for (const key of Object.keys(schema)) {
            const currentSchemaElement = schema[key];
            result += buildAdderFunction(currentSchemaElement, `${fieldName}["${key}"]`, addMap, customSchema) + '\n';
          }
          return result;
      }
  }
  throw new Error('Buffer error');
}

function buildAdderSizeFunction(
  schema: ABSchemaDef,
  fieldName: string,
  addMap: (code: string) => string,
  customSchema: CustomSchemaTypes<any>
): string {
  if (typeof schema === 'string' && customSchema[schema]) {
    return `customSchema['${schema}'].size(${fieldName})+`;
  }

  switch (schema) {
    case 'uint8':
      return `1+`;
    case 'uint16':
      return `2+`;
    case 'uint32':
      return `4+`;
    case 'int8':
      return `1+`;
    case 'int16':
      return `2+`;
    case 'int32':
      return `4+`;
    case 'float32':
      return `4+`;
    case 'float64':
      return `8+`;
    case 'boolean':
      return `1+`;
    case 'string':
      return `2+${fieldName}.length*2+`;
    default:
      assertType<ABFlags>(schema);
      switch (schema.flag) {
        case 'enum': {
          return `1+`;
        }
        case 'number-enum': {
          return `1+`;
        }
        case 'bitmask': {
          return `1+`;
        }
        case 'optional': {
          return `1+(${fieldName}!==undefined?(${buildAdderSizeFunction(
            schema.element,
            fieldName,
            addMap,
            customSchema
          )}0):0)+`;
        }
        case 'array-uint8': {
          const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
          return `1+sum(${fieldName}.map(${noPeriodsFieldName + 'Element'}=>(${buildAdderSizeFunction(
            schema.elements,
            noPeriodsFieldName + 'Element',
            addMap,
            customSchema
          )}0)))+`;
        }
        case 'array-uint16': {
          const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
          return `2+sum(${fieldName}.map(${noPeriodsFieldName + 'Element'}=>(${buildAdderSizeFunction(
            schema.elements,
            noPeriodsFieldName + 'Element',
            addMap,
            customSchema
          )}0)))+`;
        }
        case 'type-lookup': {
          let map = '{\n';
          let index = 0;
          for (const key of Object.keys(schema.elements)) {
            map += `${key}:()=>1+${buildAdderSizeFunction(schema.elements[key], fieldName, addMap, customSchema)}0,`;
            index++;
          }
          map += '}';
          return `(${map})[${fieldName}.type]()+`;
        }
        case undefined:
          assertType<{flag: undefined} & {[key: string]: any}>(schema);
          let result = '';
          for (const key of Object.keys(schema)) {
            const currentSchemaElement = schema[key];
            result += buildAdderSizeFunction(currentSchemaElement, `${fieldName}["${key}"]`, addMap, customSchema) + '';
          }
          return result + '0+';
      }
  }
  throw new Error('Buffer error');
}

function buildReaderFunction(
  schema: ABSchemaDef,
  addMap: (code: string) => string,
  customSchema: CustomSchemaTypes<any>,
  injectField?: string
): any {
  if (typeof schema === 'string' && customSchema[schema]) {
    return `customSchema['${schema}'].read(reader)`;
  }
  switch (schema) {
    case 'uint8':
      return 'reader.readUint8()';
    case 'uint16':
      return 'reader.readUint16()';
    case 'uint32':
      return 'reader.readUint32()';
    case 'int8':
      return 'reader.readInt8()';
    case 'int16':
      return 'reader.readInt16()';
    case 'int32':
      return 'reader.readInt32()';
    case 'float32':
      return 'reader.readFloat32()';
    case 'float64':
      return 'reader.readFloat64()';
    case 'boolean':
      return 'reader.readBoolean()';
    case 'string':
      return 'reader.readString()';
    default:
      assertType<ABFlags>(schema);
      switch (schema.flag) {
        case 'enum': {
          return `lookupEnum(reader.readUint8(),{${safeKeysExclude(schema, 'flag')
            .map((key) => `['${schema[key]}']:'${key}'`)
            .join(',')}})`;
        }
        case 'number-enum': {
          return `parseFloat(lookupEnum(reader.readUint8(),{${safeKeysExclude(schema, 'flag')
            .map((key) => `[${schema[key]}]:'${key}'`)
            .join(',')}}))`;
        }
        case 'bitmask': {
          return `bitmask(reader.readBits(), {${safeKeysExclude(schema, 'flag')
            .map((key) => `['${schema[key]}']:'${key}'`)
            .join(',')}})`;
        }

        case 'array-uint8': {
          return `range(reader.readUint8(),()=>(${buildReaderFunction(schema.elements, addMap, customSchema)}))`;
        }
        case 'array-uint16': {
          return `range(reader.readUint16(),()=>(${buildReaderFunction(schema.elements, addMap, customSchema)}))`;
        }
        case 'optional': {
          return `reader.readBoolean()?
              ${buildReaderFunction(schema.element, addMap, customSchema)}
            :undefined`;
        }
        case 'type-lookup': {
          let map = '{\n';
          let index = 0;
          for (const key of Object.keys(schema.elements)) {
            map += `${index}:()=>(
              ${buildReaderFunction(schema.elements[key], addMap, customSchema, `type: '${key}'`)}
              ),\n`;
            index++;
          }
          map += '}\n';
          const newMapId = addMap(map);
          return `lookup(reader.readUint8(),${newMapId})\n`;
        }
        case undefined: {
          assertType<{flag: undefined} & {[key: string]: any}>(schema);
          let str = '{';
          if (injectField) {
            str += `${injectField},\n`;
          }
          if (typeof schema !== 'object') {
            throw new Error('Buffer error');
          }
          for (const key of Object.keys(schema)) {
            const currentSchemaElement = schema[key];
            str += `['${key}'] : ${buildReaderFunction(currentSchemaElement, addMap, customSchema)},\n`;
          }
          str += '}';
          return str;
        }
      }
  }
  throw new Error('Buffer error');
}

type AdderSizeFunction<T, TCustom> = (value: T, customSchemaTypes: CustomSchemaTypes<TCustom>) => number;

type AdderFunction<T, TCustom> = (
  buff: ArrayBufferBuilder,
  value: T,
  customSchemaTypes: CustomSchemaTypes<TCustom>
) => ArrayBuffer;

type ReaderFunction<T, TCustom> = (reader: ArrayBufferReader, customSchemaTypes: CustomSchemaTypes<TCustom>) => T;

export function makeCustomSchema<T>(t: CustomSchemaTypes<T>): CustomSchemaTypes<T> {
  return t;
}

export function makeSchema<T, TCustom = CustomSchemaTypes<never>>(t: SafeSchema<T, TCustom>): SafeSchema<T, TCustom> {
  return t;
}
