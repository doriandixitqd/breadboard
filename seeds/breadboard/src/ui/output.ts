/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { type Schema } from "jsonschema";

export type OutputArgs = Record<string, unknown> & {
  schema: Schema;
};

export class Output extends HTMLElement {
  constructor(values: OutputArgs) {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: block;
        }
        * {
          white-space: pre-wrap;
        }
      </style>
    `;
    const schema = values.schema;
    if (!schema || !schema.properties) {
      root.append(JSON.stringify(values, null, 2) + "\n");
      return;
    }
    Object.entries(schema.properties).forEach(([key, property]) => {
      const html = document.createElement("span");
      html.innerHTML = `${values[key]}`;
      root.append(`${property.title}: `, html, "\n");
    });
  }
}
