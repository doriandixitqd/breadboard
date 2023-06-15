/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

type NodeIdentifier = string;

type OutputIdentifier = string;

type InputIdentifier = string;

/**
 * General node representation.
 */
interface NodeDescriptor {
  /**
   * Unique id of the node in graph.
   * @todo Should this be globally unique? Unique within a graph?
   */
  id: NodeIdentifier;
  /**
   * A list of Node's declared outputs. Outputs are where graph edges
   * originate from.
   */
  inputs: InputIdentifier[];
  /**
   * A list of Node's declared inputs. Inputs are where graph edges arrive at.
   */
  outputs: OutputIdentifier[];
}

interface FromIdentifier {
  node: NodeIdentifier;
  output: OutputIdentifier;
}

interface ToIdentifier {
  node: NodeIdentifier;
  input: InputIdentifier;
}

interface Edge {
  /**
   * The designated first edge in the graph.
   */
  entry?: boolean;
  from: FromIdentifier;
  to: ToIdentifier;
}

interface GraphDescriptor {
  edges: Edge[];
  nodes: NodeDescriptor[];
}

const graph: GraphDescriptor = {
  edges: [
    {
      entry: true,
      from: { node: "user-input", output: "text" },
      to: { node: "text-completion", input: "text" },
    },
    {
      from: { node: "text-completion", output: "completion" },
      to: { node: "console-output", input: "text" },
    },
  ],
  nodes: [
    { id: "user-input", outputs: ["text"], inputs: [] },
    {
      id: "text-completion",
      inputs: ["text"],
      outputs: ["completion"],
    },
    { id: "console-output", inputs: ["text"], outputs: [] },
  ],
};

const invokeNode = (
  node: NodeDescriptor,
  input: InputIdentifier | null
): OutputIdentifier[] => {
  console.log(
    `invoke node "${node.id}" with ${input ? `input "${input}"` : "no input"}`
  );
  if (!node.outputs.length) {
    console.log("node produces no further outputs");
  } else {
    console.log(
      `node produces outputs:${node.outputs.map((output) => `\n- ${output}`)}`
    );
  }
  return node.outputs;
};

const wire = (edge: Edge) => {
  console.log(
    `wire "${edge.from.output}" output as input "${edge.to.input}" of node "${edge.to.node}"]`
  );
};

/**
 * The dumbest possible edge follower.
 * @param graph graph to follow
 */
const follow = (graph: GraphDescriptor) => {
  let edge = graph.edges.find((edge) => edge.entry);
  let next: NodeIdentifier | null = null;
  let input: InputIdentifier | null = null;
  let outputs: OutputIdentifier[] | null = null;

  const nodes = graph.nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {} as Record<NodeIdentifier, NodeDescriptor>);

  while (edge) {
    const current = nodes[edge.from.node];
    outputs = invokeNode(current, input);
    input = edge.to.input;
    wire(edge);
    next = edge.to.node;
    edge = graph.edges.find((edge) => edge.from.node == next);
  }
  if (next) {
    const last = nodes[next];
    invokeNode(last, input);
  }
};

follow(graph);
