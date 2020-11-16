import { assertType, safeKeysExclude } from './utils';
import { ArrayBufferBuilder, ArrayBufferReader } from './arrayBufferBuilder';
export class SchemaDefiner {
    static generateAdderFunction(schema) {
        const objectMaps = [];
        let code = this.buildAdderFunction(schema, 'value', (map) => {
            const id = objectMaps.length;
            objectMaps.push(`const map${id}=${map}`);
            return `map${id}`;
        });
        // language=JavaScript
        code = `
(buff, value)=>{
${objectMaps.join(';\n')}
${code}
return buff.buildBuffer()
}`;
        // tslint:disable no-eval
        return eval(code);
    }
    static generateAdderSizeFunction(schema) {
        const objectMaps = [];
        let code = this.buildAdderSizeFunction(schema, 'value', (map) => {
            const id = objectMaps.length;
            objectMaps.push(`const map${id}=${map}`);
            return `map${id}`;
        });
        // language=JavaScript
        code = `
var sum=(items)=>{
  let c=0;
  for (let i = 0; i < items.length; i++) {
    c+=items[i];
  }
  return c;
};
(value)=>{
${objectMaps.join(';\n')}
return (${code}0);
}`;
        // console.log(code);
        // tslint:disable no-eval
        return eval(code);
    }
    static generateReaderFunction(schema) {
        const objectMaps = [];
        let code = this.buildReaderFunction(schema, (map) => {
            const id = objectMaps.length;
            objectMaps.push(`const map${id}=${map}`);
            return `map${id}`;
        });
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

(reader)=>{
${objectMaps.join(';\n')}
return (${code})
}`;
        // tslint:disable no-eval
        return eval(code);
    }
    static startAddSchemaBuffer(value, adderSizeFunction, adderFunction) {
        const size = adderSizeFunction(value);
        const arrayBufferBuilder = new ArrayBufferBuilder(size, true);
        return adderFunction(arrayBufferBuilder, value);
    }
    static startReadSchemaBuffer(buffer, readerFunction) {
        return readerFunction(new ArrayBufferReader(buffer));
    }
    static buildAdderFunction(schema, fieldName, addMap) {
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
                assertType(schema);
                switch (schema.flag) {
                    case 'enum': {
                        return `({ 
${safeKeysExclude(schema, 'flag')
                            .map((key) => `['${key}']:()=>buff.addUint8(${schema[key]}),`)
                            .join('\n')}
})[${fieldName}]();`;
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
      ${SchemaDefiner.buildAdderFunction(schema.elements, noPeriodsFieldName + 'Element', addMap)}
    }`;
                    }
                    case 'array-uint16': {
                        const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
                        return `
           buff.addUint16(${fieldName}.length);
    for (const ${noPeriodsFieldName}Element of ${fieldName}) {
      ${SchemaDefiner.buildAdderFunction(schema.elements, noPeriodsFieldName + 'Element', addMap)}
    }`;
                    }
                    case 'type-lookup': {
                        let map = '{\n';
                        let index = 0;
                        for (const key of Object.keys(schema.elements)) {
                            map += `['${key}']:()=>{
              buff.addUint8(${index});
              ${SchemaDefiner.buildAdderFunction(schema.elements[key], fieldName, addMap)}
              },`;
                            index++;
                        }
                        map += '}\n';
                        return `(${map})[${fieldName}.type]();`;
                    }
                    case 'optional': {
                        return `buff.addBoolean(${fieldName}!==undefined);
            if(${fieldName}!==undefined){
            ${SchemaDefiner.buildAdderFunction(schema.element, fieldName, addMap)}
            }`;
                    }
                    case undefined:
                        assertType(schema);
                        let result = '';
                        for (const key of Object.keys(schema)) {
                            if (key === 'type' || key === 'entityType') {
                                continue;
                            }
                            const currentSchemaElement = schema[key];
                            result += this.buildAdderFunction(currentSchemaElement, `${fieldName}["${key}"]`, addMap) + '\n';
                        }
                        return result;
                }
        }
        throw new Error('Buffer error');
    }
    static buildAdderSizeFunction(schema, fieldName, addMap) {
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
                assertType(schema);
                switch (schema.flag) {
                    case 'enum': {
                        return `1+`;
                    }
                    case 'bitmask': {
                        return `1+`;
                    }
                    case 'optional': {
                        return `1+${SchemaDefiner.buildAdderSizeFunction(schema.element, fieldName, addMap)}`;
                    }
                    case 'array-uint8': {
                        const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
                        return `1+sum(${fieldName}.map(${noPeriodsFieldName + 'Element'}=>(${SchemaDefiner.buildAdderSizeFunction(schema.elements, noPeriodsFieldName + 'Element', addMap)}0)))+`;
                    }
                    case 'array-uint16': {
                        const noPeriodsFieldName = fieldName.replace(/\["/g, '_').replace(/"]/g, '');
                        return `2+sum(${fieldName}.map(${noPeriodsFieldName + 'Element'}=>(${SchemaDefiner.buildAdderSizeFunction(schema.elements, noPeriodsFieldName + 'Element', addMap)}0)))+`;
                    }
                    case 'type-lookup': {
                        let map = '{\n';
                        let index = 0;
                        for (const key of Object.keys(schema.elements)) {
                            map += `${key}:()=>1+${SchemaDefiner.buildAdderSizeFunction(schema.elements[key], fieldName, addMap)}0,`;
                            index++;
                        }
                        map += '}';
                        return `(${map})[${fieldName}.type]()+`;
                    }
                    case undefined:
                        assertType(schema);
                        let result = '';
                        for (const key of Object.keys(schema)) {
                            if (key === 'type' || key === 'entityType') {
                                continue;
                            }
                            const currentSchemaElement = schema[key];
                            result += this.buildAdderSizeFunction(currentSchemaElement, `${fieldName}["${key}"]`, addMap) + '';
                        }
                        return result + '0+';
                }
        }
        throw new Error('Buffer error');
    }
    static buildReaderFunction(schema, addMap, injectField) {
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
                assertType(schema);
                switch (schema.flag) {
                    case 'enum': {
                        return `lookupEnum(reader.readUint8(),{${safeKeysExclude(schema, 'flag')
                            .map((key) => `['${schema[key]}']:'${key}'`)
                            .join(',')}})`;
                    }
                    case 'bitmask': {
                        return `bitmask(reader.readBits(), {${safeKeysExclude(schema, 'flag')
                            .map((key) => `['${schema[key]}']:'${key}'`)
                            .join(',')}})`;
                    }
                    case 'array-uint8': {
                        return `range(reader.readUint8(),()=>(${SchemaDefiner.buildReaderFunction(schema.elements, addMap)}))`;
                    }
                    case 'array-uint16': {
                        return `range(reader.readUint16(),()=>(${SchemaDefiner.buildReaderFunction(schema.elements, addMap)}))`;
                    }
                    case 'optional': {
                        return `reader.readBoolean()?
              ${SchemaDefiner.buildReaderFunction(schema.element, addMap)}
            :undefined`;
                    }
                    case 'type-lookup': {
                        let map = '{\n';
                        let index = 0;
                        for (const key of Object.keys(schema.elements)) {
                            map += `${index}:()=>(
              ${SchemaDefiner.buildReaderFunction(schema.elements[key], addMap, `type: '${key}'`)}
              ),\n`;
                            index++;
                        }
                        map += '}\n';
                        const newMapId = addMap(map);
                        return `lookup(reader.readUint8(),${newMapId})\n`;
                    }
                    case undefined: {
                        assertType(schema);
                        let str = '{';
                        if (injectField) {
                            str += `${injectField},\n`;
                        }
                        for (const key of Object.keys(schema)) {
                            if (key === 'type' || key === 'entityType') {
                                continue;
                            }
                            const currentSchemaElement = schema[key];
                            str += `['${key}'] : ${this.buildReaderFunction(currentSchemaElement, addMap)},\n`;
                        }
                        str += '}';
                        return str;
                    }
                }
        }
        throw new Error('Buffer error');
    }
}
//# sourceMappingURL=schemaDefiner.js.map