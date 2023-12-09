/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import Core from "@google-labs/core-kit";
import Starter from "@google-labs/llm-starter";

const board = new Board({
  title: "Board Caller",
  description:
    "Takes a tool-calling-capable generator and a list of board URLs, and helps generator call these boards as tools",
  version: "0.0.6",
});

const starter = board.addKit(Starter);
const core = board.addKit(Core);

const output = board.output({
  $id: "output",
  schema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        title: "Text",
        description: "The text generated by the tool",
      },
      name: {
        type: "string",
        title: "Tool Name",
        description: "The name of the tool that generated the text",
      },
      context: {
        type: "array",
        title: "Context",
        description: "The conversation context",
      },
    },
  },
});

const parameters = board.input({
  $id: "parameters",
  schema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        title: "Text",
        description: "The text to use with tool calling",
        default: "What is the square root of e?",
      },
      context: {
        type: "array",
        title: "Context",
        description: "An array of messages to use as conversation context",
        items: {
          type: "object",
        },
        default: "[]",
      },
      generator: {
        type: "string",
        title: "Generator",
        description: "The URL of the generator to call",
        examples: ["/graphs/openai-gpt-35-turbo.json"],
      },
      boards: {
        type: "array",
        title: "Tools",
        description: "URLs of boards to use as tools",
        items: {
          type: "string",
        },
        examples: [
          '[ "https://raw.githubusercontent.com/google/labs-prototypes/main/seeds/graph-playground/graphs/math.json", "/graphs/search-summarize.json" ]',
        ],
      },
    },
    required: ["text", "boards"],
  },
});

/**
 * Formats a list of boards as function declarations that can be supplied
 * to a generator.
 */
const formatFunctionDeclarations = core.invoke((board, input, output) => {
  const core = board.addKit(Core);

  const turnBoardsToFunctions = core.map((_, input, output) => {
    // for each URL, invoke board-as-function.
    input
      .wire(
        "item->boardURL",
        core
          .invoke({
            $id: "boardToFunction",
            path: "/graphs/board-as-function.json",
          })
          .wire("function->", output)
      )
      .wire("item->boardURL", output);
  });

  input.wire(
    "boards->list",
    turnBoardsToFunctions
      .wire(
        "list->json",
        starter
          .jsonata({
            $id: "formatAsTools",
            expression: `[function]`,
          })
          .wire("result->tools", output)
      )
      .wire(
        "list->json",
        starter
          .jsonata({
            expression: `$merge([$.{ function.name: boardURL }])`,
            $id: "makeURLMap",
          })
          .wire("result->urlMap", output)
      )
  );
});

const generate = core
  .invoke({ $id: "generate" })
  .wire(
    "<-useStreaming",
    core.passthrough({ $id: "noStreaming", useStreaming: false })
  );

const getBoardPath = starter.jsonata({
  $id: "getBoardPath",
  expression: `$merge([{
    "path": $lookup(urlMap, tool_calls[0].name) },
    tool_calls[0].args
  ])`,
  raw: true,
});

const formatOutput = starter
  .jsonata({
    $id: "formatOutput",
    expression: `{ "text": text, "name": tool_calls[0].name, "context": context }`,
    raw: true,
  })
  .wire("<-tool_calls", generate);

parameters
  .wire("text->", generate)
  .wire("context->", generate)
  .wire(
    "boards->",
    formatFunctionDeclarations
      .wire("tools->", generate)
      .wire("urlMap->", getBoardPath)
  )
  .wire(
    "generator->path",
    generate
      .wire(
        "tool_calls->",
        getBoardPath.wire(
          "*->",
          core
            .invoke({ $id: "callBoardAsTool" })
            .wire("text->", formatOutput.wire("*->", output))
        )
      )
      .wire("context->", formatOutput)
  );

export default board;
