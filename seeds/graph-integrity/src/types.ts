/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SafetyLabel } from "./label.js";

/**
 * Information flow control label values, i.e. levels of trust.
 *
 * This will become more complex over time, but for now, just a simple enum.
 * Flow is allowed from TRUSTED to TRUSTED, from either to UNTRUSTED,
 * but not from UNTRUSTED to TRUSTED.
 */
export enum SafetyLabelValue {
  UNTRUSTED,
  TRUSTED,
}

// TODO: Add labels (and constraints) to edges

export interface IncomingEdge {
  from: Node;
}

export interface OutgoingEdge {
  to: Node;
}

export enum NodeRoles {
  placeHolder,
  passthrough,
}

export interface Node {
  node: { id: string };
  incoming: IncomingEdge[];
  outgoing: OutgoingEdge[];
  label: SafetyLabel;
  constraint?: SafetyLabel;
  role?: NodeRoles;
}

export interface Graph {
  nodes: Node[];
}
