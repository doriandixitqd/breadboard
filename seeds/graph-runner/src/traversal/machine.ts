/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  Edge,
  EdgeMap,
  GraphDescriptor,
  InputValues,
  NodeDescriptor,
} from "../types.js";
import { GraphRepresentation } from "./representation.js";
import { MachineResult } from "./result.js";

export class TraversalMachineIterator implements AsyncIterator<MachineResult> {
  graph: GraphRepresentation;
  #current: MachineResult;

  constructor(graph: GraphRepresentation, result: MachineResult) {
    this.graph = graph;
    this.#current = result;
  }

  async next(): Promise<IteratorResult<MachineResult>> {
    // If there are no missing inputs, let's consume the outputs
    if (!this.#current.skip) {
      const { outputs, newOpportunities, descriptor } = this.#current;

      this.#current.opportunities.push(...newOpportunities);
      this.#current.state.update(descriptor.id, newOpportunities, outputs);
    }

    // Now, we're ready to start the next iteration.

    // If there are no more opportunities, we're done.
    if (this.#current.opportunities.length === 0)
      return { done: true, value: null };

    // Otherwise, let's pop the next opportunity from the queue.
    const opportunity = this.#current.opportunities.shift() as Edge;

    const { heads, nodes, tails } = this.graph;

    const toNode = opportunity.to;
    const currentDescriptor = nodes.get(toNode);
    if (!currentDescriptor) throw new Error(`No node found for id "${toNode}"`);

    const incomingEdges = heads.get(toNode) || [];
    const inputs = TraversalMachine.wire(
      incomingEdges,
      this.#current.state.getAvailableOutputs(toNode)
    );

    const missingInputs = TraversalMachine.computeMissingInputs(
      incomingEdges,
      inputs,
      currentDescriptor
    );

    const newOpportunities = tails.get(toNode) || [];

    // Pour configuration values into inputs. These are effectively like
    // constants.
    const inputsWithConfiguration = {
      ...currentDescriptor.configuration,
      ...inputs,
    };

    this.#current = new MachineResult(
      currentDescriptor,
      inputsWithConfiguration,
      missingInputs,
      this.#current.opportunities,
      newOpportunities,
      this.#current.state
    );
    return { done: false, value: this.#current };
  }
}

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

  static wire(heads: Edge[], outputEdges: EdgeMap): InputValues {
    const result: InputValues = {};
    heads.forEach((head) => {
      const from = head.from;
      const outputs = outputEdges.get(from) || {};
      const out = head.out;
      if (!out) return;
      if (out === "*") {
        Object.assign(result, outputs);
        return;
      }
      const output = outputs[out];
      const input = head.in;
      if (!input) return;
      if (output != null && output != undefined) result[input] = output;
    });
    return result;
  }

  static computeMissingInputs(
    heads: Edge[],
    inputs: InputValues,
    current: NodeDescriptor
  ) {
    const requiredInputs: string[] = [
      ...new Set(
        heads
          .filter((edge: Edge) => !!edge.in && !edge.optional)
          .map((edge: Edge) => edge.in || "")
      ),
    ];
    const inputsWithConfiguration = new Set();
    Object.keys(inputs).forEach((key) => inputsWithConfiguration.add(key));
    if (current.configuration) {
      Object.keys(current.configuration).forEach((key) =>
        inputsWithConfiguration.add(key)
      );
    }
    return requiredInputs.filter(
      (input) => !inputsWithConfiguration.has(input)
    );
  }
}
