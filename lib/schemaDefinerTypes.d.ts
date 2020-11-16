export declare type Discriminate<T, TField extends keyof T, TValue extends T[TField]> = T extends {
    [field in TField]: TValue;
} ? T : never;
export declare type SDEnum<T extends string> = {
    [key in T]: number;
} & {
    flag: 'enum';
};
export declare type SDBitmask<T> = {
    [keyT in keyof T]-?: number;
} & {
    flag: 'bitmask';
};
export declare type SDArray<TElements> = {
    elements: TElements;
    flag: 'array-uint8' | 'array-uint16';
};
export declare type SDTypeLookupElements<TElements extends {
    type: string;
}> = {
    elements: {
        [key in TElements['type']]: SDTypeLookup<TElements, key>;
    };
    flag: 'type-lookup';
};
export declare type SDTypeLookup<TItem extends {
    type: string;
}, TKey extends TItem['type']> = SDSimpleObject<Omit<Discriminate<TItem, 'type', TKey>, 'type'>>;
export declare type SDTypeElement<TItem extends {
    type: string;
}> = SDSimpleObject<Omit<TItem, 'type'>>;
export declare type SDSimpleObject<TItem> = {
    [keyT in OptionalPropertyOf<TItem>]: {
        element: SDElement<Required<TItem>, keyT>;
        flag: 'optional';
    };
} & {
    [keyT in RequiredPropertyOf<TItem>]: SDElement<Required<TItem>, keyT>;
};
declare type OptionalPropertyOf<T> = Exclude<{
    [K in keyof T]: T extends Record<K, T[K]> ? never : K;
}[keyof T], undefined>;
declare type RequiredPropertyOf<T> = Exclude<{
    [K in keyof T]: T extends Record<K, T[K]> ? K : never;
}[keyof T], undefined>;
declare type Simple<T> = T extends string ? 'string' | SDEnum<T> : T extends number ? 'uint8' | 'uint16' | 'uint32' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64' : T extends boolean ? 'boolean' : never;
export declare type SDElement<T, TKey extends keyof T> = T[TKey] extends string | boolean | number ? Simple<T[TKey]> : T[TKey] extends Array<any> ? T[TKey][number] extends string | boolean | number ? SDArray<Simple<T[TKey][number]>> : T[TKey][number] extends {
    type: string;
} ? SDArray<SDTypeLookupElements<T[TKey][number]>> | SDArray<SDSimpleObject<T[TKey][number]>> : SDArray<SDSimpleObject<T[TKey][number]>> : T[TKey] extends {
    [key in keyof T[TKey]]: boolean;
} ? SDBitmask<T[TKey]> : T[TKey] extends {
    type: string;
} ? SDTypeLookupElements<T[TKey]> | SDSimpleObject<T[TKey]> : T[TKey] extends {} ? SDSimpleObject<T[TKey]> : never;
export declare type ABFlags = {
    flag: 'enum';
} | {
    element: any;
    flag: 'optional';
} | {
    flag: 'bitmask';
} | {
    elements: any;
    flag: 'array-uint16';
} | {
    elements: any;
    flag: 'array-uint8';
} | {
    elements: {
        [key: string]: ABSchemaDef;
    };
    flag: 'type-lookup';
} | ({
    flag: undefined;
} & {
    [key: string]: any;
});
export declare type ABSchemaDef = ABFlags | string;
export {};
//# sourceMappingURL=schemaDefinerTypes.d.ts.map