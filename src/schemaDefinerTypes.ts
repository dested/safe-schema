import {ArrayBufferBuilder, ArrayBufferReader} from './arrayBufferBuilder';

type Discriminate<T, TField extends keyof T, TValue extends T[TField]> = T extends {[field in TField]: TValue}
  ? T
  : never;
export type SafeSchemaEnum<T extends string> = {[key in T]: number} & {flag: 'enum'};
export type SafeSchemaNumberEnum<T extends number> = {[key in T]: number} & {flag: 'number-enum'};
export type SafeSchemaBitmask<T> = {[keyT in keyof T]-?: number} & {flag: 'bitmask'};
export type SafeSchemaArray<TElements> = {elements: TElements; flag: 'array-uint8' | 'array-uint16'};

export type SafeSchemaTypeLookupElements<TElements extends {type: string}, TCustom> = {
  elements: {
    [key in TElements['type']]: SafeSchemaTypeLookup<TElements, key, TCustom>;
  };
  flag: 'type-lookup';
};
export type SafeSchemaTypeLookup<
  TItem extends {type: string},
  TKey extends TItem['type'],
  TCustom
> = SafeSchemaSimpleObject<Omit<Discriminate<TItem, 'type', TKey>, 'type'>, TCustom>;

export type SafeSchemaTypeElement<TItem extends {type: string}, TCustom> = SafeSchemaSimpleObject<
  Omit<TItem, 'type'>,
  TCustom
>;

export type SafeSchemaSimpleObject<TItem, TCustom> = {
  [keyT in OptionalPropertyOf<TItem>]: {element: SafeSchema<Required<TItem>[keyT], TCustom>; flag: 'optional'};
} &
  {
    [keyT in RequiredPropertyOf<TItem>]: SafeSchema<Required<TItem>[keyT], TCustom>;
  };

type OptionalPropertyOf<T> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
  }[keyof T],
  undefined
>;
type RequiredPropertyOf<T> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? K : never;
  }[keyof T],
  undefined
>;

type SafeSchemaSimple<T> = T extends string
  ? 'string' | SafeSchemaEnum<T>
  : T extends number
  ? 'uint8' | 'uint16' | 'uint32' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64' | SafeSchemaNumberEnum<T>
  : T extends boolean
  ? 'boolean'
  : never;

export type SafeSchema<T, TCustom = unknown> =
  | (T extends string | boolean | number
      ? SafeSchemaSimple<T>
      : T extends Array<any>
      ? T[number] extends string | boolean | number
        ? SafeSchemaArray<SafeSchemaSimple<T[number]>>
        : T[number] extends {type: string}
        ?
            | SafeSchemaArray<SafeSchemaTypeLookupElements<T[number], TCustom>>
            | SafeSchemaArray<SafeSchemaSimpleObject<T[number], TCustom>>
        : SafeSchemaArray<SafeSchemaSimpleObject<T[number], TCustom>>
      : T extends {[key in keyof T]: boolean}
      ? SafeSchemaBitmask<T> | SafeSchemaSimpleObject<T, TCustom>
      : T extends {}
      ? T extends {type: string}
        ? SafeSchemaTypeLookupElements<T, TCustom>
        : SafeSchemaSimpleObject<T, TCustom>
      : never)
  | keyof TCustom;

export type CustomSchemaTypes<TCustom> = {
  [key in keyof TCustom]: {
    read: (buffer: ArrayBufferReader) => any;
    write: (model: any, buffer: ArrayBufferBuilder) => void;
    size: (model: any) => number;
  };
};

export type ABFlags =
  | {flag: 'enum'}
  | {flag: 'number-enum'}
  | {element: any; flag: 'optional'}
  | {flag: 'bitmask'}
  | {elements: any; flag: 'array-uint16'}
  | {elements: any; flag: 'array-uint8'}
  | {elements: {[key: string]: ABSchemaDef}; flag: 'type-lookup'}
  | ({flag: undefined} & {[key: string]: any});
export type ABSchemaDef = ABFlags | string;
