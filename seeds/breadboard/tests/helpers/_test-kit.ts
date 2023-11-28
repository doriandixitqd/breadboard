/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "../../src/board.js";
import { KitBuilder } from "../../src/kits/index.js";
import { StreamCapability } from "../../src/stream.js";
import {
  BreadboardCapability,
  GraphDescriptor,
  InputValues,
  NodeHandlerContext,
} from "../../src/types.js";

type IncludeInputValues = InputValues & {
  graph?: GraphDescriptor;
};

type InvokeInputValues = InputValues & {
  board?: BreadboardCapability;
};
/**
 * This is a Kit designed specifically for use in the testing harness.
 */
export const TestKit = new KitBuilder({
  url: ".",
}).build({
  /**
   * Just a no-op node.
   * @param inputs Any inputs to the node.
   * @returns Sme inputs
   */
  noop: async (inputs) => inputs,
  /**
   * Just a no-op node, called "test, for when need two noop nodes with
   * different names. This is useful for testing that the name is stripped
   * from the regular "noop".
   * @param inputs Any inputs to the node.
   * @returns Sme inputs
   */
  test: async (inputs) => inputs,
  /**
   * This is a primitive implementation of the `include` node in Core Kit,
   * just enough for testing.
   * @param inputs
   * @param context
   * @returns
   */
  include: async (inputs: IncludeInputValues, context: NodeHandlerContext) => {
    const { graph } = inputs;
    if (!graph) {
      throw new Error("Must provide a graph to include");
    }
    const board = await Board.fromGraphDescriptor(graph);
    return await board.runOnce(inputs, context);
  },
  invoke: async (inputs: InvokeInputValues, context: NodeHandlerContext) => {
    const { board, ...args } = inputs;

    if (!board) {
      throw new Error("Must provide a board to invoke");
    }

    const runnableBoard = await Board.fromBreadboardCapability(board);

    return await runnableBoard.runOnce(args, context);
  },
  /**
   * Reverses provided string inputs. Will crash if provided non-string inputs.
   * @param inputs InputValues
   */
  reverser: async (inputs) => {
    return Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [
        key,
        (inputs[key] = [...(value as string)].reverse().join("")),
      ])
    );
  },
  /**
   * Supplies a simple stream output that can be used to test interactions with
   * streams.
   */
  streamer: async () => {
    const words = "Breadboard is a project that helps you make AI recipes.";
    const stream = new ReadableStream({
      start(controller) {
        for (const word of words.split(" ")) {
          controller.enqueue(`${word} `);
        }
        controller.close();
      },
    });
    return { stream: new StreamCapability(stream) };
  },
});

/**
 * This kit is used to test proxying and provides a different behavior than
 * the reverser in TestKit.
 */
export const MirrorUniverseKit = new KitBuilder({
  url: "mirror-universe-kit",
}).build({
  /**
   * Unlike the reverser in TestKit, it orders letters alphabetically.
   * @param inputs InputValues
   */
  reverser: async (inputs) => {
    return Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [
        key,
        (inputs[key] = [...(value as string)].sort().join("")),
      ])
    );
  },
});
