/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  InputValues,
  NodeValue,
  OutputValues,
} from "@google-labs/graph-runner";
import { EmbedTextResponse, palm } from "@google-labs/palm-lite";

export type EmbedTextInputs = NodeValue & {
  /**
   * Prompt for text completion.
   */
  text: string;
  /**
   * The Google Cloud Platform API key
   */
  PALM_KEY: string;
};

export default {
  invoke: async (inputs: InputValues): Promise<OutputValues> => {
    const values = inputs as EmbedTextInputs;
    if (!values.PALM_KEY)
      throw new Error("Embedding requires `PALM_KEY` input");
    if (!values.text) throw new Error("Embedding requires `text` input");

    const query = { text: values.text };

    let embedding: number[] | undefined;
    // Because Embedding API is a bit flaky, we try a few times before giving up.
    let tries = 3;
    while (!embedding && tries-- > 0) {
      try {
        const request = palm(values.PALM_KEY).embedding(query);
        const data = await fetch(request);
        const response = (await data.json()) as EmbedTextResponse;
        embedding = response?.embedding?.value;
      } catch (e) {
        // TODO: Implement proper error handling.
      }
    }
    if (!embedding)
      throw new Error(`No embedding returned for "${values.text}"`);

    return { embedding } as unknown as OutputValues;
  },
};
