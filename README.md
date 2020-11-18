# Safe Schema

A dependency-less solution to **safely** serialize your TypeScript models to and from `ArrayBuffer`s.

## Features

- Uses your TypeScript object definitions as a starting point
- Type Safe throughout
- Broad model support
- Lightning Fast due to AOT
- First class support for Type Lookups and Enums
- Supports custom serializations
- Well tested
- No external dependencies

## Install

With npm:

```
$ npm install safe-schema --save
```

With yarn:

```
$ yarn add safe-schema
```

## Basic Usage

```ts
// Import
import {makeSchema, SchemaDefiner} from 'safe-schema';

// Define your model
type SimpleMessage = {count: number};

// Safely define your schema BASED on your model
const SimpleMessageSchema = makeSchema<SimpleMessage>({count: 'uint8'});

// ...

// Initialize the AOT code generator (only once)
const generator = SchemaDefiner.generate<SimpleMessage>(SimpleMessageSchema);

// Turn your object into an ArrayBuffer
const buffer = SchemaDefiner.toBuffer({count: 12}, generator);

assert(buffer.byteLength === 1);

// ...

// Turn your ArrayBuffer back into your object
const result = SchemaDefiner.fromBuffer(buffer, generator);

// Use your 100% type safe object on the other side of the wire
assert(result.count === 12);
```

## How It Works

You define your network schema just as you normally would using TypeScript types, then use `SafeSchema` to generate a runtime version of that schema. You will get full intellisense support when invoking `makeSchema<SimpleMessage>({})`, allowing you to easily define the DataTypes of your model (for instance `number` as `uint16`), as well as the ability to easily **change your schema** and have TypeScript throw the appropriate errors for missing values at compile time.

Calling `SchemaDefiner.generate<SimpleMessage>(SimpleMessageSchema)` generates JavaScript **at runtime** that is hand built to read and write your model to and from an `ArrayBuffer`. There is no switch case behind the scenes, every model generates unique JavaScript which executes **lightning fast**! Only exactly as many bytes will be sent over the wire as needed.

Take a look at the [complexGameState](__tests__/complexGameState.ts), [kitchenSink](__tests__/kitchenSink.ts), and the other tests for complex and real-world examples.

## Why It's Needed

Every other solution to this problem (protocol buffers, JSON, etc), did not allow me to define my models the way I wanted to, **using TypeScript**. TypeScript's modeling abilities are incredibly feature rich and I did not want to lose any of that functionality just because I needed to serialize my data. That's why I built in first class support for things like Discriminating Unions and Enums, so I can have a richly defined schema with the minimum amount of bytes used.

## API Documentation

- [`numbers`](#numbers)
- [`string`](#string)
- [`boolean`](#boolean)
- [`optional`](#optional)
- [`array`](#array)
- [`type-lookup`](#type-lookup)
- [`enum`](#enum)
- [`number-enum`](#number-enum)
- [`bitmask`](#bitmask)
- [`custom`](#custom)

### numbers

<a name="numbers" />

When you define your model to be a number in TypeScript you must tell the Schema what type and how big the number is. This is to save on memory over the wire and to not make assumptions.

Example:

```ts
type SimpleMessage = {count: number};

const SimpleMessageSchema = makeSchema<SimpleMessage>({count: 'int32'});
```

TypeScript intellisense will only allow values that are valid. The valid values are:

- `uint8`
- `uint16`
- `uint32`
- `int8`
- `int16`
- `int32`
- `float32`
- `float64`

### string

<a name="string" />

SafeSchema encodes strings into utf16 values, plus one uint16 for its length. It does not currently support strings over 65535 in length.

Example:

```ts
type SimpleMessage = {count: string};

const SimpleMessageSchema = makeSchema<SimpleMessage>({count: 'string'});
```

### boolean

<a name="boolean" />

SafeSchema encodes booleans into a single uint8 value

Example:

```ts
type SimpleMessage = {count: boolean};

const SimpleMessageSchema = makeSchema<SimpleMessage>({count: 'boolean'});
```

### optional

<a name="optional" />

SafeSchema allows any value to be optionally defined. This will send an extra byte over the wire to denote if the value is there or not. The type must be defined as optional in your model

Example:

```ts
type SimpleMessage = {count?: number};

const SimpleMessageSchema = makeSchema<SimpleMessage>({
  count: {
    flag: 'optional',
    element: 'uint8',
  },
});
```

### array

<a name="array" />

SafeSchema can encode any type as an array. You must specify the max length of the array, either `array-uint8` or `array-uint16`

Example:

```ts
type SimpleMessage = {count: boolean[]};
const SimpleMessageSchema = makeSchema<SimpleMessage>({
  count: {
    flag: 'array-uint8',
    elements: 'boolean',
  },
});
```

```ts
type ComplexMessage = {count: {shoes: number}[]};
const ComplexMessageSchema = makeSchema<ComplexMessage>({
  count: {
    flag: 'array-uint8',
    elements: {shoes: 'float64'},
  },
});
```

### type-lookup

<a name="type-lookup" />

SafeSchema has first class support for type lookups. This is useful for Discriminating Unions in TypeScript.

Example:

```ts
type SimpleMessage = {type: 'run'; duration: number} | {type: 'walk'; speed: number};

const SimpleMessageSchema = makeSchema<SimpleMessage>({
  flag: 'type-lookup',
  elements: {
    run: {duration: 'uint8'},
    walk: {speed: 'float32'},
  },
});
```

### enum

<a name="enum" />

SafeSchema has first class support TypeScript enums through string unions. It will only send a single byte over the wire.

Example:

```ts
type SimpleMessage = {weapon: 'sword' | 'laser' | 'shoe'};

const SimpleMessageSchema = makeSchema<SimpleMessage>({
  flag: 'enum',
  sword: '0',
  laser: '1',
  shoe: '2',
});
```

### number-enum

<a name="number-enum" />

SafeSchema has first class support TypeScript enums through number unions. It will only send a single byte over the wire.

Example:

```ts
type SimpleMessage = {team: 1 | 2 | 3};

const SimpleMessageSchema = makeSchema<SimpleMessage>({
  flag: 'enum',
  1: 1,
  2: 2,
  3: 3,
});
```

### bitmask

<a name="bitmask" />

In rare cases you may want to send a bitmasked value over the wire. You define this as a single object that **only has boolean values**. It will send a single byte over the wire, and be serialized back into the complex object.

Example:

```ts
type BitMaskMessage = {
  switcher: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
};

const BitMaskMessageSchema = makeSchema<BitMaskMessage>({
  switcher: {
    flag: 'bitmask',
    up: 0,
    down: 1,
    left: 2,
    right: 3,
  },
});
```

### custom

<a name="custom" />

If these data types don't suit all of your needs, you can define your own custom schema type.

You must define a `customSchemaType` using `makeCustom`. The keys of the object you pass in will be the string you use in your schema. You must define how to read, write, and the size of the model. This `customSchemaType` can now be passed into `makeSchema` so it is aware of your custom keys. 

Note that you must also pass `customSchemaTypes` into the `generate` function

Example:

```ts
import {makeCustom, makeSchema, SchemaDefiner} from 'safe-schema';

export const customSchemaTypes = makeCustom({
  specialId: {
    // this turns the string 123-456 into two int16's
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

type CustomTypeMessage = {testId: string};

const CustomTypeMessageSchema = makeSchema<CustomTypeMessage, typeof customSchemaTypes>({testId: 'specialId'});

const generator = SchemaDefiner.generate<CustomTypeMessage, typeof customSchemaTypes>(
  CustomTypeMessageSchema,
  customSchemaTypes
);
```
