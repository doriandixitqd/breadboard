/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputStageResult, RunResult } from "./run.js";
import {
  InputValues,
  NodeHandlerContext,
  NodeValue,
  OutputValues,
  Schema,
  TraversalResult,
} from "./types.js";

export const createErrorMessage = (
  inputName: string,
  context: NodeHandlerContext,
  required: boolean
): string => {
  const boardTitle = context.board?.title ?? context.board?.url;
  const requiredText = required ? "required " : "";
  return `Missing ${requiredText}input "${inputName}"${
    boardTitle ? ` for board "${boardTitle}".` : "."
  }`;
};

export const bubbleUpInputsIfNeeded = async (
  context: NodeHandlerContext,
  inputs: InputValues,
  result: TraversalResult
): Promise<void> => {
  // If we have no way to bubble up inputs, we just return and not
  // enforce required inputs.
  if (!context.requestInput) return;

  const outputs = (await result.outputsPromise) ?? {};
  const reader = new InputSchemaReader(outputs, inputs);
  result.outputsPromise = reader.read(createBubbleHandler(context));
};

export const createBubbleHandler = (context: NodeHandlerContext) => {
  return (async (name, schema, required) => {
    if (required) {
      throw new Error(createErrorMessage(name, context, required));
    }
    const value = await context.requestInput?.(name, schema);
    if (value === undefined) {
      if (schema.default !== undefined) {
        return schema.default;
      }
      throw new Error(createErrorMessage(name, context, required));
    }
    return value;
  }) satisfies InputSchemaHandler;
};

export type InputSchemaHandler = (
  name: string,
  schema: Schema,
  required: boolean
) => Promise<NodeValue>;

export class InputSchemaReader {
  #currentOutputs: OutputValues;
  #inputs: InputValues;

  constructor(currentOutputs: OutputValues, inputs: InputValues) {
    this.#currentOutputs = currentOutputs;
    this.#inputs = inputs;
  }

  async read(handler: InputSchemaHandler): Promise<OutputValues> {
    if (!("schema" in this.#inputs)) return this.#currentOutputs;

    const schema = this.#inputs.schema as Schema;

    if (!schema.properties) return this.#currentOutputs;

    const entries = Object.entries(schema.properties);

    const newOutputs: OutputValues = {};
    for (const [name, property] of entries) {
      if (name in this.#currentOutputs) {
        newOutputs[name] = this.#currentOutputs[name];
        continue;
      }
      const required = schema.required?.includes(name) ?? false;
      const value = await handler(name, property, required);
      newOutputs[name] = value;
    }

    return {
      ...this.#currentOutputs,
      ...newOutputs,
    };
  }
}

export class RequestedInputsManager {
  #context: NodeHandlerContext;
  #cache: Map<string, NodeValue> = new Map();

  constructor(context: NodeHandlerContext) {
    this.#context = context;
  }

  createHandler(
    next: (result: RunResult) => Promise<void>,
    result: TraversalResult
  ) {
    return async (name: string, schema: Schema) => {
      const cachedValue = this.#cache.get(name);
      if (cachedValue !== undefined) return cachedValue;
      const requestInputResult = {
        ...result,
        inputs: {
          schema: { type: "object", properties: { [name]: schema } },
        },
      };
      await next(new InputStageResult(requestInputResult));
      const outputs = await requestInputResult.outputsPromise;
      let value = outputs && outputs[name];
      if (value === undefined) {
        value = await this.#context.requestInput?.(name, schema);
      }
      this.#cache.set(name, value);
      return value;
    };
  }
}
