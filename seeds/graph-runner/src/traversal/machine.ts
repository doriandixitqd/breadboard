/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { GraphDescriptor } from "../types.js";
import { TraversalMachineIterator } from "./iterator.js";
import { GraphRepresentation } from "./representation.js";
import { MachineResult } from "./result.js";

export class TraversalMachine implements AsyncIterable<MachineResult> {
  descriptor: GraphDescriptor;
  graph: GraphRepresentation;
  previousResult?: MachineResult;

  constructor(descriptor: GraphDescriptor, result?: MachineResult) {
    this.descriptor = descriptor;
    this.graph = new GraphRepresentation(descriptor);
    this.previousResult = result;
  }

  [Symbol.asyncIterator](): AsyncIterator<MachineResult> {
    return this.start();
  }

  start(): TraversalMachineIterator {
    if (this.previousResult)
      return new TraversalMachineIterator(this.graph, this.previousResult);

    const { entries } = this.graph;
    if (entries.length === 0) throw new Error("No entry node found in graph.");
    // Create fake edges to represent entry points.
    const opportunities = entries.map((entry) => ({
      from: "$entry",
      to: entry,
    }));
    const entryResult = new MachineResult(
      { id: "$empty", type: "$empty" },
      {},
      [],
      opportunities,
      []
    );
    return new TraversalMachineIterator(this.graph, entryResult);
  }
}
