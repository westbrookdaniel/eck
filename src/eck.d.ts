// TODO: improve code documentation
/**
 * @param schema - The schema to validate the data against
 * @param errorSchema - An optional schema to map the error messages
 *
 * @returns A function to validate the data against the schema
 */
export function schema<S extends Schema>(
  schema: S,
  errorSchema?: ErrorSchema,
): Validate<S>;

export type Schema = {
  [key: string]:
    | TypeOf
    | SpecialKeys
    | SchemaFn
    | Schema
    | (TypeOf | SpecialKeys | SchemaFn)[];
};

export type SchemaFn = (value: any, data: any) => boolean;

export type SpecialKeys = "optional";

export type TypeOf =
  | "function"
  | "object"
  | "array"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined"
  | "symbol"
  | "bigint";

export type ErrorSchema = {
  [key: string]: ErrorSchema | ErrorSchemaMatcher | string;
};

type ErrorSchemaMatcher = {
  MISSING?: string;
  INVALID?: string;
  [key: number]: string;
};

export type Validate<S extends Schema> = (data: any) => ValidateResult<S>;

export type ValidateResult<S extends Schema> = {
  error?: ResultError<S>;
  data?: ResultData<S>;
};

type ResultError<S> = any;

type ResultData<S> =
  // TODO: improve this type so it looks less ugly
  MergeRecord<
    {
      [K in keyof OptionalFields<S>]?: ResultValue<OptionalFields<S>[K]>;
    } & {
      [K in keyof RequiredFields<S>]: ResultValue<RequiredFields<S>[K]>;
    }
  >;

type MergeRecord<T> = {
  [K in keyof T]: T[K];
};

type RequiredFields<S> = Pick<
  S,
  { [K in keyof S]: isOptional<S[K]> extends true ? never : K }[keyof S]
>;

type OptionalFields<S> = Pick<
  S,
  { [K in keyof S]: isOptional<S[K]> extends true ? K : never }[keyof S]
>;

type isOptional<D> = D extends any[]
  ? OnlyOptional<D[0]> extends never
    ? false
    : true
  : false;

type OnlyOptional<D> = D extends "optional" ? "optional" : never;

type ResultValue<D> = D extends any[]
  ? ResultUnionValue<D[0]>
  : D extends Function
  ? GuardType<D>
  : D extends object
  ? ResultData<D>
  : D extends TypeOf
  ? TypeOfType<D>
  : any;

type ResultUnionValue<D> = TypesFromUnion<RemoveOptional<D>>;

type TypesFromUnion<T> = T extends (...args: any) => any
  ? GuardType<T>
  : TypeOfType<T>;

type RemoveOptional<T> = T extends "optional" ? never : T;

type GuardType<T> = T extends (value: any, data: any) => value is infer U
  ? U
  : never;

type TypeOfType<D> = D extends "string"
  ? string
  : D extends "number"
  ? number
  : D extends "boolean"
  ? boolean
  : D extends "null"
  ? null
  : D extends "undefined"
  ? undefined
  : D extends "symbol"
  ? symbol
  : D extends "bigint"
  ? bigint
  : D extends "function"
  ? Function
  : D extends "object"
  ? object
  : D extends "array"
  ? any[]
  : D;
