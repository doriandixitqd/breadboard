/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";
import { Nursery } from "@google-labs/node-nursery";

import { PromptMaker } from "./template.js";

const BASE = "v2-multi-agent";

const maker = new PromptMaker(BASE);

const board = new Board();
const kit = board.addKit(Starter);
const nursery = board.addKit(Nursery);

// Inputs
const prologue = board.passthrough({ $id: "prologue" });
const epilogue = board.passthrough({ $id: "epilogue" });
const schema = board.passthrough({ $id: "schema" });

// Outputs
const $error = board.output({ $id: "error" });
const $completion = board.output({ $id: "completion" });

// Template
const template = await maker.prompt("schemish-generator", "schemishGenerator");

// Wire all useful parts of the input.
board
  .input()
  .wire("prologue->", prologue)
  .wire("epilogue->", epilogue)
  .wire("schema->", schema);

const convertToSchemish = nursery.schemish({ $id: "schemish" });
schema.wire("schema->", convertToSchemish);

const validateJson = nursery.validateJson({ $id: "validateJSON" });
validateJson.wire("json->completion", $completion).wire("error->", $error);
schema.wire("schema->", validateJson);

const generator = kit
  .generateText({
    stopSequences: ["Tool:", "Customer:", "\n\n"],
    safetySettings: [
      {
        category: "HARM_CATEGORY_DEROGATORY",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
    ],
  })
  .wire("<-PALM_KEY.", kit.secrets(["PALM_KEY"]))
  .wire("completion->json", validateJson)
  .wire("filters->error", $error);

const prompt = kit
  .promptTemplate(...template)
  .wire("<-prologue", prologue)
  .wire("<-epilogue", epilogue)
  .wire("<-schemish", convertToSchemish);

prompt.wire("prompt->text", generator);

export const schemishGenerator = board;
