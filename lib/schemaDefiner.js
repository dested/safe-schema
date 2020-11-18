"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSchema = exports.makeCustomSchema = exports.generateSchema = void 0;
const utils_1 = require("./utils");
const arrayBufferBuilder_1 = require("./arrayBufferBuilder");
function generateAdderFunction(schema, customSchema = {}) {
    const objectMaps = [];
    let code = buildAdderFunction(schema, 'value', (map) => {
        const id = objectMaps.length;
        objectMaps.push(`const map${id}=${map}`);
        return `map${id}`;
    }, customSchema);
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
function generateAdderSizeFunction(schema, customSchema = {}) {
    const objectMaps = [];
    let code = buildAdderSizeFunction(schema, 'value', (map) => {
        const id = objectMaps.length;
        objectMaps.push(`const map${id}=${map}`);
        return `map${id}`;
    }, customSchema);
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
function generateReaderFunction(schema, customSchema = {}) {
    const objectMaps = [];
    let code = buildReaderFunction(schema, (map) => {
        const id = objectMaps.length;
        objectMaps.push(`const map${id}=${map}`);
        return `map${id}`;
    }, customSchema);
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
function generateSchema(schema, customSchema) {
    const readerFunction = generateReaderFunction(schema, customSchema);
    const adderFunction = generateAdderFunction(schema, customSchema);
    const adderSizeFunction = generateAdderSizeFunction(schema, customSchema);
    let generator = {
        readerFunction,
        adderFunction,
        adderSizeFunction,
        customSchema: customSchema !== null && customSchema !== void 0 ? customSchema : {},
    };
    return {
        toBuffer: (value) => {
            return toBuffer(value, generator);
        },
        fromBuffer: (value) => {
            return fromBuffer(value, generator);
        },
    };
}
exports.generateSchema = generateSchema;
function toBuffer(value, generator) {
    const size = generator.adderSizeFunction(value, generator.customSchema);
    const arrayBufferBuilder = new arrayBufferBuilder_1.ArrayBufferBuilder(size, true);
    return generator.adderFunction(arrayBufferBuilder, value, generator.customSchema);
}
function fromBuffer(buffer, generator) {
    return generator.readerFunction(new arrayBufferBuilder_1.ArrayBufferReader(buffer), generator.customSchema);
}
function buildAdderFunction(schema, fieldName, addMap, customSchema) {
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
            utils_1.assertType(schema);
            switch (schema.flag) {
                case 'enum': {
                    return `({ 
${utils_1.safeKeysExclude(schema, 'flag')
                        .map((key) => `['${key}']:()=>buff.addUint8(${schema[key]}),`)
                        .join('\n')}
})[${fieldName}]();`;
                }
                case 'number-enum': {
                    return `({ 
${utils_1.safeKeysExclude(schema, 'flag')
                        .map((key) => `[${key}]:()=>buff.addUint8(${schema[key]}),`)
                        .join('\n')}
})[${fieldName}]();`;
                }
                case 'bitmask': {
                    return `buff.addBits(...[
${utils_1.safeKeysExclude(schema, 'flag')
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
                    let map = '{\n';
                    let index = 0;
                    for (const key of Object.keys(schema.elements)) {
                        map += `['${key}']:()=>{
              buff.addUint8(${index});
              ${buildAdderFunction(schema.elements[key], fieldName, addMap, customSchema)}
              },`;
                        index++;
                    }
                    map += '}\n';
                    return `(${map})[${fieldName}.type]();`;
                }
                case 'optional': {
                    return `buff.addBoolean(${fieldName}!==undefined);
            if(${fieldName}!==undefined){
            ${buildAdderFunction(schema.element, fieldName, addMap, customSchema)}
            }`;
                }
                case undefined:
                    utils_1.assertType(schema);
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
function buildAdderSizeFunction(schema, fieldName, addMap, customSchema) {
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
            utils_1.assertType(schema);
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
                    return `1+(${fieldName}!==undefined?(${buildAdderSizeFunction(schema.element, fieldName, addMap, customSchema)}0):0)+`;
                }
                case 'array-uint8': {
                    const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
                    return `1+sum(${fieldName}.map(${noPeriodsFieldName + 'Element'}=>(${buildAdderSizeFunction(schema.elements, noPeriodsFieldName + 'Element', addMap, customSchema)}0)))+`;
                }
                case 'array-uint16': {
                    const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
                    return `2+sum(${fieldName}.map(${noPeriodsFieldName + 'Element'}=>(${buildAdderSizeFunction(schema.elements, noPeriodsFieldName + 'Element', addMap, customSchema)}0)))+`;
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
                    utils_1.assertType(schema);
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
function buildReaderFunction(schema, addMap, customSchema, injectField) {
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
            utils_1.assertType(schema);
            switch (schema.flag) {
                case 'enum': {
                    return `lookupEnum(reader.readUint8(),{${utils_1.safeKeysExclude(schema, 'flag')
                        .map((key) => `['${schema[key]}']:'${key}'`)
                        .join(',')}})`;
                }
                case 'number-enum': {
                    return `parseFloat(lookupEnum(reader.readUint8(),{${utils_1.safeKeysExclude(schema, 'flag')
                        .map((key) => `[${schema[key]}]:'${key}'`)
                        .join(',')}}))`;
                }
                case 'bitmask': {
                    return `bitmask(reader.readBits(), {${utils_1.safeKeysExclude(schema, 'flag')
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
                    utils_1.assertType(schema);
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
function makeCustomSchema(t) {
    return t;
}
exports.makeCustomSchema = makeCustomSchema;
function makeSchema(t) {
    return t;
}
exports.makeSchema = makeSchema;
//# sourceMappingURL=schemaDefiner.js.map