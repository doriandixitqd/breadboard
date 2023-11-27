/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { recipe } from "@google-labs/breadboard";

import { core } from "@google-labs/core-kit";

export const graph = recipe(async (inputs) => {
  const { foo } = await core.passthrough(inputs);
  return { foo };
});

export const example = { foo: "bar", bar: "baz" };

export default await graph.serialize({
  title: "New: Simple imperative function",
});
