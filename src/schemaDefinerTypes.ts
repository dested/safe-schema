import {ArrayBufferBuilder, ArrayBufferReader} from './arrayBufferBuilder';

type Discriminate<T, TField extends keyof T, TValue extends T[TField]> = T extends {[field in TField]: TValue}
  ? T
  : never;
export type SafeSchemaEnum<T extends string> = {[key in T]: number} & {flag: 'enum'};
export type SafeSchemaNumberEnum<T extends number> = {[key in T]: number} & {flag: 'number-enum'};
export type SafeSchemaBitmask<T> = {[keyT in keyof T]-?: number} & {flag: 'bitmask'};
export type SafeSchemaArray<TElements> = {elements: TElements; flag: 'array-uint8' | 'array-uint16'};

export type SafeSchemaTypeLookupElements<TElements extends {type: string}, TCustoms = never> = {
  elements: {
    [key in TElements['type']]: SafeSchemaTypeLookup<TElements, key, TCustoms>;
  };
  flag: 'type-lookup';
};
export type SafeSchemaTypeLookup<
  TItem extends {type: string},
  TKey extends TItem['type'],
  TCustoms = never
> = SafeSchemaSimpleObject<Omit<Discriminate<TItem, 'type', TKey>, 'type'>, TCustoms>;

export type SafeSchemaTypeElement<TItem extends {type: string}, TCustoms = never> = SafeSchemaSimpleObject<
  Omit<TItem, 'type'>,
  TCustoms
>;

export type SafeSchemaSimpleObject<TItem, TCustoms = never> = {
  [keyT in OptionalPropertyOf<TItem>]: {element: SafeSchemaElement<Required<TItem>, keyT, TCustoms>; flag: 'optional'};
} &
  {
    [keyT in RequiredPropertyOf<TItem>]: SafeSchemaElement<Required<TItem>, keyT, TCustoms>;
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
  ? 'uint8' | 'uint16' | 'uint32' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64'
  : T extends boolean
  ? 'boolean'
  : never;

export type SafeSchemaElement<T, TKey extends keyof T, TCustoms = never> =
  | (T[TKey] extends string | boolean | number
      ? SafeSchemaSimple<T[TKey]>
      : T[TKey] extends Array<any>
      ? T[TKey][number] extends string | boolean | number
        ? SafeSchemaArray<SafeSchemaSimple<T[TKey][number]>>
        : T[TKey][number] extends {type: string}
        ?
            | SafeSchemaArray<SafeSchemaTypeLookupElements<T[TKey][number], TCustoms>>
            | SafeSchemaArray<SafeSchemaSimpleObject<T[TKey][number], TCustoms>>
        : SafeSchemaArray<SafeSchemaSimpleObject<T[TKey][number], TCustoms>>
      : T[TKey] extends {[key in keyof T[TKey]]: boolean}
      ? SafeSchemaBitmask<T[TKey]>
      : T[TKey] extends {type: string}
      ? SafeSchemaTypeLookupElements<T[TKey], TCustoms> | SafeSchemaSimpleObject<T[TKey], TCustoms>
      : T[TKey] extends {}
      ? SafeSchemaSimpleObject<T[TKey], TCustoms>
      : never)
  | TCustoms;

export type SafeSchema<T, TCustoms = never> =
  | (T extends string | boolean | number
      ? SafeSchemaSimple<T>
      : T extends Array<any>
      ? T[number] extends string | boolean | number
        ? SafeSchemaArray<SafeSchemaSimple<T[number]>>
        : T[number] extends {type: string}
        ?
            | SafeSchemaArray<SafeSchemaTypeLookupElements<T[number], TCustoms>>
            | SafeSchemaArray<SafeSchemaSimpleObject<T[number], TCustoms>>
        : SafeSchemaArray<SafeSchemaSimpleObject<T[number], TCustoms>>
      : T extends {[key in keyof T]: boolean}
      ? SafeSchemaBitmask<T> | SafeSchemaSimpleObject<T, TCustoms>
      : T extends {type: string}
      ? SafeSchemaTypeLookupElements<T, TCustoms> | SafeSchemaSimpleObject<T, TCustoms>
      : T extends {}
      ? SafeSchemaSimpleObject<T, TCustoms>
      : never)
  | TCustoms;

export type CustomSchemaTypes<TCustom> = {
  [key in keyof TCustom]: {
    read: (buffer: ArrayBufferReader) => TCustom[key];
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
