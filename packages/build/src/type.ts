/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A subset of JSON schema types which can be converted to TypeScript types at
 * compile time.
 */
export type BreadboardType =
  | BasicBreadboardType
  | AdvancedBreadboardType<unknown>;

export type BasicBreadboardType = "string" | "number" | "boolean";

/**
 * Create a type that can have any of the given `members`. Equivalent to JSON
 * Schema's `anyOf`, and TypeScript's union operator (`|`).
 *
 * @param members The types which are allowed to match.
 * @returns A `BreadboardType` which
 */
export function anyOf<
  T extends [BreadboardType, BreadboardType, ...BreadboardType[]],
>(...members: T) {
  return new AnyOf<T>(members);
}

/**
 * If none of the included type utilities are able to express both the required
 * JSON Schema and its corresponding TypeScript type, then `escapeHatch` can be
 * used to create a type that directly specifies both.
 *
 * @param jsonSchema The JSON schema that will always be returned when a port
 * has this type.
 * @returns A `BreadboardType` which carries both the TypeScript type provided
 * via the `T` generic parameter, and the corresponding JSON schema.
 */
export function escapeHatch<T>(jsonSchema: JSONSchema) {
  return new EscapeHatch<T>(jsonSchema);
}

const AdvancedType = Symbol();

export interface AdvancedBreadboardType<T> {
  readonly [AdvancedType]: T;
  toJSONSchema(): JSONSchema;
}

/**
 * The TypeScript types that can be automatically mapped back to
 * BreadboardTypes.
 */
export type BreadboardTypeScriptTypes = string | number | boolean;

/**
 * Convert from {@link BreadboardType} to TypeScript type.
 */
export type TypeScriptTypeFromBreadboardType<BT extends BreadboardType> =
  BT extends "string"
    ? string
    : BT extends "number"
      ? number
      : BT extends "boolean"
        ? boolean
        : BT extends AdvancedBreadboardType<unknown>
          ? BT[typeof AdvancedType]
          : never;

/**
 * Convert from TypeScript type to {@link BreadboardType}.
 */
export type BreadboardTypeFromTypeScriptType<
  TT extends BreadboardTypeScriptTypes,
> = TT extends string
  ? "string"
  : TT extends number
    ? "number"
    : TT extends boolean
      ? "boolean"
      : never;

// TODO(aomarks) Expand this to the full vocabulary of JSONSchema so that
// `escapeHatch` can be fully flexible (for now it's OK to cast to JSONSchema).
export type JSONSchema =
  | { type: "string" | "number" | "boolean" }
  | { anyOf: JSONSchema[] };

export function toJSONSchema(type: BreadboardType): JSONSchema {
  return typeof type === "string" ? { type } : type.toJSONSchema();
}

export type { AnyOf };
class AnyOf<T extends [BreadboardType, BreadboardType, ...BreadboardType[]]> {
  #members: T;
  readonly [AdvancedType]!: TypeScriptTypeFromBreadboardType<T[number]>;

  constructor(members: T) {
    this.#members = members;
  }

  toJSONSchema(): JSONSchema {
    return {
      anyOf: this.#members.map(toJSONSchema),
    };
  }
}

export type { EscapeHatch };
class EscapeHatch<T> {
  #jsonSchema: JSONSchema;
  readonly [AdvancedType]!: T;
  constructor(jsonSchema: JSONSchema) {
    this.#jsonSchema = jsonSchema;
  }
  toJSONSchema() {
    return this.#jsonSchema;
  }
}
