/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import JSONKit from "@google-labs/json-kit";
import { Starter } from "@google-labs/llm-starter";

const board = new Board();
const kit = board.addKit(Starter);
const json = board.addKit(JSONKit);

const secrets = kit.secrets({
  keys: ["PALM_KEY", "GOOGLE_CSE_ID"],
});

board
  .input({
    schema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          title: "Query",
          description: "What would you like to search for?",
        },
      },
      required: ["text"],
    },
  })
  .wire(
    "text->query",
    kit
      .urlTemplate({
        template:
          "https://www.googleapis.com/customsearch/v1?key={PALM_KEY}&cx={GOOGLE_CSE_ID}&q={query}",
      })
      .wire("<-PALM_KEY.", secrets)
      .wire("<-GOOGLE_CSE_ID.", secrets)
      .wire(
        "url",
        kit
          .fetch()
          .wire(
            "response->json",
            json
              .jsonata({ expression: "$join(items.snippet, '\n')" })
              .wire("result->text", board.output())
          )
      )
  );

export default board;
