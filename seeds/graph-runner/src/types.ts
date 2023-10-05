/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Capability {
  readonly kind: string;
}

export type ErrorCapability = Capability & {
  readonly kind: "error";
  readonly error?: Error;
  readonly inputs?: InputValues;
  readonly descriptor?: NodeDescriptor;
};

/**
 * A type representing a valid JSON value.
 */
export type NodeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | NodeValue[]
  | Capability
  | { [key: string]: NodeValue };

/**
 * Unique identifier of a node in a graph.
 */
export type NodeIdentifier = string;

/**
 * Unique identifier of a node's output.
 */
export type OutputIdentifier = string;

/**
 * Unique identifier of a node's input.
 */
export type InputIdentifier = string;

/**
 * Unique identifier of a node's type.
 */
export type NodeTypeIdentifier = string;

/**
 * Represents a node in a graph.
 */
export type NodeDescriptor = {
  /**
   * Unique id of the node in graph.
   */
  id: NodeIdentifier;

  /**
   * Type of the node. Used to look up the handler for the node.
   */
  type: NodeTypeIdentifier;

  /**
   * Configuration of the node.
   */
  configuration?: NodeConfiguration;
};

/**
 * Represents an edge in a graph.
 */
export type Edge = {
  /**
   * The node that the edge is coming from.
   */
  from: NodeIdentifier;

  /**
   * The node that the edge is going to.
   */
  to: NodeIdentifier;

  /**
   * The input of the `to` node. If this value is undefined, then
   * the then no data is passed as output of the `from` node.
   */
  in?: InputIdentifier;

  /**
   * The output of the `from` node. If this value is "*", then all outputs
   * of the `from` node are passed to the `to` node. If this value is undefined,
   * then no data is passed to any inputs of the `to` node.
   */
  out?: OutputIdentifier;

  /**
   * If true, this edge is optional: the data that passes through it is not
   * considered a required input to the node.
   */
  optional?: boolean;

  /**
   * If true, this edge acts as a constant: the data that passes through it
   * remains available even after the node has consumed it.
   */
  constant?: boolean;
};

/**
 * Represents a "kit": a collection of `NodeHandlers`. The basic permise here
 * is that people can publish kits with interesting handlers, and then
 * graphs can specify which ones they use.
 * The `@google-labs/llm-starter` package is an example of kit.
 */
export type KitDescriptor = {
  /**
   * The URL pointing to the location of the kit.
   */
  url: string;

  /**
   * The list of node types in this kit that are used by the graph.
   * If left blank or omitted, all node types are assumed to be used.
   */
  using?: string[];
};

/**
 * Represents graph metadata.
 */
export type GraphMetadata = {
  /**
   * The URL pointing to the location of the graph.
   * This URL is used to resolve relative paths in the graph.
   * If not specified, the paths are assumed to be relative to the current
   * working directory.
   */
  url?: string;
  /**
   * The title of the graph.
   */
  title?: string;
  /**
   * The description of the graph.
   */
  description?: string;
  /**
   * Version of the graph.
   * [semver](https://semver.org/) format is encouraged.
   */
  version?: string;
};

/**
 * Unique identifier of a graph.
 */
export type GraphIdentifier = string;

/**
 * Represents a collection of sub-graphs.
 * The key is the identifier of the sub-graph.
 * The value is the descriptor of the sub-graph.
 */
export type SubGraphs = Record<GraphIdentifier, GraphDescriptor>;

/**
 * Represents a graph.
 */
export type GraphDescriptor = GraphMetadata & {
  /**
   * The collection of all edges in the graph.
   */
  edges: Edge[];

  /**
   * The collection of all nodes in the graph.
   */
  nodes: NodeDescriptor[];

  /**
   * All the kits (collections of node handlers) that are used by the graph.
   */
  kits?: KitDescriptor[];

  /**
   * Sub-graphs that are also described by this graph representation.
   */
  graphs?: SubGraphs;

  /**
   * Arguments that are passed to the graph, useful to bind values to lambdas.
   */
  args?: InputValues;
};

/**
 * The Map of queues of all outputs that were sent to a given node,
 * and a map of these for all nodes.
 */
export type NodeValuesQueues = Map<string, NodeValue[]>;
export type NodeValuesQueuesMap = Map<NodeIdentifier, NodeValuesQueues>;

export interface QueuedNodeValuesState {
  state: NodeValuesQueuesMap;
  constants: NodeValuesQueuesMap;
  wireOutputs(opportunites: Edge[], outputs: OutputValues): void;
  getAvailableInputs(nodeId: NodeIdentifier): InputValues;
  useInputs(node: NodeIdentifier, inputs: InputValues): void;
}

export interface CompletedNodeOutput {
  promiseId: symbol;
  outputs: OutputValues;
  newOpportunities: Edge[];
}

export interface TraversalResult {
  descriptor: NodeDescriptor;
  inputs: InputValues;
  missingInputs: string[];
  opportunities: Edge[];
  newOpportunities: Edge[];
  state: QueuedNodeValuesState;
  outputsPromise?: Promise<OutputValues>;
  pendingOutputs: Map<symbol, Promise<CompletedNodeOutput>>;
  skip: boolean;
}

/**
 * Values that are supplied as inputs to the `NodeHandler`.
 */
export type InputValues = Record<InputIdentifier, NodeValue>;

/**
 * Values that the `NodeHandler` outputs.
 */
export type OutputValues = Partial<Record<OutputIdentifier, NodeValue>>;

/**
 * Values that are supplied as part of the graph. These values are merged with
 * the `InputValues` and supplied as inputs to the `NodeHandler`.
 */
export type NodeConfiguration = Record<string, NodeValue>;

/**
 * A function that represents a type of a node in the graph.
 */
export type NodeHandler<T> =
  | ((
      /**
       * The inputs that are supplied to the node.
       */
      inputs: InputValues,
      /**
       * The context of the node's invocation.
       */
      context: T
    ) => Promise<OutputValues | void>)
  // Same as above, but without the context received.
  | ((inputs: InputValues) => Promise<OutputValues | void>);

/**
 * All known node handlers.
 */
export type NodeHandlers<T = object> = Record<
  NodeTypeIdentifier,
  NodeHandler<T>
>;
