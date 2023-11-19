/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Board } from "@google-labs/breadboard";
import { Core } from "@google-labs/core-kit";
import { Starter } from "@google-labs/llm-starter";
import { PaLMKit } from "@google-labs/palm-kit";

const board = new Board({
  title: "Endless Debate with Voice",
  description:
    "A simple board that demonstrates how to create a conversation loop. It's a debate between a scientist named Albert and a philosopher named Friedrich. Albert is warm, funny, and inquisitve. Friedrich is  disagreeable, brooding, skeptical, and sarcastic.\n\nTo give replies a bit more variability, a concept of `voice` is introduced: each reply is independently reinterpreted to give it a bit more variety and avoid the trap of the dialog becoming too mechanical and predictable.\nThis board goes on forever, so you'll have to reload or close the page (or press Ctrl+C in console) to end it.",
  version: "0.0.1",
});
const kit = board.addKit(Starter);
const core = board.addKit(Core);
const palm = board.addKit(PaLMKit);

const rememberFriedrich = core.append({ $id: "rememberFriedrich" });
const rememberAlbert = core.append({ $id: "rememberAlbert" });
const rememberQuestion = core.append({ $id: "rememberQuestion" });

rememberQuestion.wire("accumulator->", rememberAlbert);
rememberAlbert.wire("accumulator->", rememberFriedrich);
rememberFriedrich.wire("accumulator->", rememberAlbert);

const palm_key = kit.secrets({ keys: ["PALM_KEY"] });

// Store Friedrich's template so that we can refer back to it to create a
// conversation loop.
const friedrich = kit.promptTemplate({
  template: "Add a single argument to a debate between a philosopher named Friedrich and a scientist named Albert. You are Friedrich, and you are disagreeable, brooding, skeptical, sarcastic, yet passionate about uncovering new insights with Albert. To keep the debate rich and satisfying, you vary your sentence patterns and keep them from repeating.\n\n== Conversation Transcript\n{{context}}\n\n==Additional Single Argument\nFriedrich:",
});

const albert = kit
  .promptTemplate({
    $id: "albert",
    template: "Add a single argument to a debate between a scientist named Albert and a philosopher named Friedrich. You are Albert, and you are warm, funny, inquisitve, and passionate about uncovering new insights with Friedrich. To keep the debate rich and satisfying, you vary your sentence patterns and keep them from repeating.\"\n\n== Debate History\n{{context}}\n\n==Additional Single Argument\n\nAlbert:",
  })
  .wire(
    "prompt->text",
    palm
      .generateText({
        stopSequences: ["\nFriedrich", "\n**Friedrich"],
        safetySettings: [
          {
            category: "HARM_CATEGORY_DEROGATORY",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_TOXICITY",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      })
      .wire(
        "completion->Albert",
        rememberAlbert.wire("accumulator->context", friedrich)
      )
      .wire(
        "completion->context",
        kit
          .promptTemplate({
            $id: "albert-voice",
            template: "Restate the paragraph below in the voice of a brillant 20th century scientist. Change the structure of the sentences completely to mix things up.\n==Paragraph\n{{context}}\n\nRestatement:",
          })
          .wire(
            "prompt->text",
            palm
              .generateText()
              .wire("<-PALM_KEY.", palm_key)
              .wire(
                "completion->text",
                board.output({
                  $id: "albertSays",
                  schema: {
                    type: "object",
                    properties: {
                      text: {
                        type: "string",
                        title: "Albert",
                        description: "What Albert says",
                      },
                    },
                    required: ["text"],
                  },
                })
              )
          )
      )
      .wire("<-PALM_KEY.", palm_key)
  );

friedrich.wire(
  "prompt->text",
  palm
    .generateText({
      stopSequences: ["\nAlbert", "\n**Albert"],
      safetySettings: [
        {
          category: "HARM_CATEGORY_DEROGATORY",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_TOXICITY",
          threshold: "BLOCK_ONLY_HIGH",
        },
      ],
    })
    .wire(
      "completion->Friedrich",
      rememberFriedrich.wire("accumulator->context", albert)
    )
    .wire(
      "completion->context",
      kit
        .promptTemplate({
          $id: "friedrich-voice",
          template: "Restate the paragraph below in the voice of a 19th century philosopher. Change the structure of the sentences completely to mix things up.\n==Paragraph\n{{context}}\n\nRestatement:",
        })
        .wire(
          "prompt->text",
          palm
            .generateText()
            .wire("<-PALM_KEY.", palm_key)
            .wire(
              "completion->text",
              board.output({
                $id: "friedrichSays",
                schema: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      title: "Friedrich",
                      description: "What Friedrich says",
                    },
                  },
                  required: ["text"],
                },
              })
            )
        )
    )
    .wire("<-PALM_KEY.", palm_key)
);

board
  .input({
    schema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          title: "Topic",
          description: "What is the topic of the debate?",
        },
      },
      required: ["text"],
    },
  })
  .wire("text->topic", rememberQuestion.wire("accumulator->context", albert));

export default board;
