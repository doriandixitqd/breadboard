/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";

const math = new Board({
  title: "The Calculator Recipe (with retries)",
  description:
    "A simple AI pattern that leans on the power of the LLMs to generate language to solve math problems. Retries 5 times.",
  version: "0.0.1",
});
const kit = math.addKit(Starter);

math
  .input({
    $id: "math-question",
    schema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          title: "Math problem",
          description: "Ask a math question",
        },
      },
      required: ["text"],
    },
  })
  .wire(
    "text->question",
    kit
      .promptTemplate(
        "Translate the math problem below into a JavaScript function named `compute` that can be executed to provide the answer to the problem\nMath Problem: {{question}}\nSolution:",
        { $id: "math-function" }
      )
      .wire(
        "prompt->text",
        math
          .invoke({ path: "./retry.json" })
          .wire(
            "lambda<-board",
            math.lambda((board, input, output) => {
              const completion = kit
                .generateText({ $id: "math-function-generator" })
                .wire("<-PALM_KEY", kit.secrets(["PALM_KEY"]));
              const compute = kit.runJavascript("compute", { $id: "compute" });

              input.wire("text->", completion);
              completion.wire("completion->code", compute);

              compute.wire("result->text", output);

              // Hack for error correction: Make sure completion is listed.
              board
                .passthrough()
                .wire("$error<-", compute)
                .wire("completion<-", completion);
            })
          )
          .wire(
            "text->",
            math.output({
              $id: "print",
              schema: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    title: "Answer",
                    description: "The answer to the math problem",
                  },
                },
                required: ["text"],
              },
            })
          )
      )
  );

export default math;