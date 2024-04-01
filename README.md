# Breadboard

![Milestone](https://img.shields.io/badge/milestone-M4-red) ![Stability](https://img.shields.io/badge/stability-wip-green) [![Discord](https://img.shields.io/discord/1138546999872999556?logo=discord)](https://discord.gg/breadboard)

A library for prototyping generative AI applications.

This library was inspired by the hardware maker community and their boundless creativity. They make amazing things with off-the-shelf parts and a [breadboard](https://learn.sparkfun.com/tutorials/how-to-use-a-breadboard/all), just wiring things together and trying this and that until it works.

Breadboard is an attempt to bring the same spirit of creativity and simplicity to making generative AI applications.

This library's design emphasizes two key properties:

:one: **Ease and flexibility of wiring**. Make wiring prototypes easy and fun.

:two: **Modularity and composability**. Easily share, remix, reuse, and compose prototypes.

## Documentation

The documentation is a bit of a work in progress. The best place to start is the [this guide](https://breadboard-ai.github.io/breadboard/docs/happy-path/), although it is still incomplete. Please bear with us as we bring our words up to speed with our thoughts/actions.

## Monorepo

This is the monorepo for Breadboard. See [DEVELOPING.md](./DEVELOPING.md) for instructions on how to work within it.

## Requirements

Breadboard requires [Node](https://nodejs.org/) version >=v19.0.0.

## Packages

| Package Name                                                              | NPM                                                                                                                                                                   | Description                                                                                           |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| _Core_                                                                    |                                                                                                                                                                       |                                                                                                       |
| [`@google-labs/breadboard`](./packages/breadboard)                        | [![Published on npm](https://img.shields.io/npm/v/@google-labs/breadboard.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/breadboard)                       | The core breadboard library                                                                           |
| [`@breadboard-ai/build`](./packages/build)                                | [![Published on npm](https://img.shields.io/npm/v/@breadboard-ai/build.svg?logo=npm)](https://www.npmjs.com/package/@breadboard-ai/build)                             | Library for defining boards and node types                                                            |
| _Kits_                                                                    |                                                                                                                                                                       |                                                                                                       |
| [`@google-labs/core-kit`](./packages/core-kit)                            | [![Published on npm](https://img.shields.io/npm/v/@google-labs/core-kit.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/core-kit)                           | Breadboard kit for foundational board operations like `map` and `invoke`                              |
| [`@google-labs/json-kit`](./packages/json-kit)                            | [![Published on npm](https://img.shields.io/npm/v/@google-labs/json-kit.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/json-kit)                           | Breadboard kit for working with JSON in boards                                                        |
| [`@google-labs/template-kit`](./packages/template-kit)                    | [![Published on npm](https://img.shields.io/npm/v/@google-labs/template-kit.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/template-kit)                   | Breadboard kit to help with templating                                                                |
| [`@google-labs/palm-kit`](./packages/palm-kit)                            | [![Published on npm](https://img.shields.io/npm/v/@google-labs/palm-kit.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/palm-kit)                           | Breadboard kit for working with the PaLM API in boards                                                |
| [`@exadev/breadboard-kits`](https://github.com/ExaDev-io/breadboard-kits) | [![Published on npm](https://img.shields.io/npm/v/@exadev/breadboard-kits?logo=npm)](https://www.npmjs.com/package/@exadev/breadboard-kits)                           | A variety of utilities, general purpose nodes, and kits specific scenarios                            |
| _Tools & Support Libraries_                                               |                                                                                                                                                                       |                                                                                                       |
| [`@google-labs/breadboard-cli`](./packages/breadboard-cli)                | [![Published on npm](https://img.shields.io/npm/v/@google-labs/breadboard-cli.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/breadboard-cli)               | Command-line tool for generating, running, and debugging boards                                       |
| [`@google-labs/breadboard-extension`](./packages/breadboard-extension)    | _Unpublished_                                                                                                                                                         | VSCode extension to assist in building Breadboard applications                                        |
| [`@google-labs/breadboard-server`](./packages/breadboard-server)          | [![Published on npm](https://img.shields.io/npm/v/@google-labs/breadboard-server.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/breadboard-server)         | Library for running boards as Google Cloud Functions                                                  |
| [`@google-labs/breadboard-ui`](./packages/breadboard-ui)                  | [![Published on npm](https://img.shields.io/npm/v/@google-labs/breadboard-ui.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/breadboard-ui)                 | Web Components for building applications with Breadboard                                              |
| [`@google-labs/create-breadboard-kit`](./packages/create-breadboard-kit)  | [![Published on npm](https://img.shields.io/npm/v/@google-labs/create-breadboard-kit.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/create-breadboard-kit) | NPM init/create script for creating a kit                                                             |
| [`@google-labs/create-breadboard`](./packages/create-breadboard)          | [![Published on npm](https://img.shields.io/npm/v/@google-labs/create-breadboard.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/create-breadboard)         | NPM init/create script for creating a board                                                           |
| _Examples_                                                                |                                                                                                                                                                       |                                                                                                       |
| [`@google-labs/cloud-function`](./packages/cloud-function)                | _Unpublished_                                                                                                                                                         | Example of using Cloud Functions with Breadboard                                                      |
| [`@google-labs/coffee-bot-board`](./packages/coffee-bot-board)            | _Unpublished_                                                                                                                                                         | Example board that can order coffee                                                                   |
| [`@google-labs/graph-playground`](./packages/graph-playground)            | _Unpublished_                                                                                                                                                         | Examples project that runs some sample boards                                                         |
| [`@google-labs/breadboard-hello-world`](./packages/hello-world)           | _Unpublished_                                                                                                                                                         | Example board based on the Breadboard tutorial                                                        |
| _Internal/Experiments_                                                    |                                                                                                                                                                       |                                                                                                       |
| [`@google-labs/breadboard-web`](./packages/breadboard-web)                | _Unpublished_                                                                                                                                                         | Library for running boards in a web browser                                                           |
| [`@google-labs/breadboard-website`](./packages/website)                   | _Unpublished_                                                                                                                                                         | The documentation website for Breadboard                                                              |
| [`@google-labs/breadbuddy`](./packages/breadbuddy)                        | _Unpublished_                                                                                                                                                         | Library for generating web applications from boards                                                   |
| [`@google-labs/discovery-types`](./packages/discovery-types)              | _Unpublished_                                                                                                                                                         | Library which generates TypeScript declarations from the PaLM API Discovery Document                  |
| [`@google-labs/graph-integrity`](./packages/graph-integrity)              | _Unpublished_                                                                                                                                                         | Library that validates boards                                                                         |
| [`@google-labs/node-nursery-web`](./packages/node-nursery-web)            | _Unpublished_                                                                                                                                                         | A place for experimenting with board nodes that aren't yet ready for their own package (web specific) |
| [`@google-labs/node-nursery`](./packages/node-nursery)                    | _Unpublished_                                                                                                                                                         | A place for experimenting with board nodes that aren't yet ready for their own package (general)      |
| [`@google-labs/node-proxy-server`](./packages/node-proxy-server)          | _Unpublished_                                                                                                                                                         | Library that allows running nodes remotely                                                            |
| [`@google-labs/pinecone-kit`](./packages/pinecone-kit)                    | _Unpublished_                                                                                                                                                         | Library for working with the Pinecone vector database in boards                                       |
| _Deprecated_                                                              |                                                                                                                                                                       |                                                                                                       |
| [`@google-labs/graph-runner`](./packages/graph-runner)                    | [![Published on npm](https://img.shields.io/npm/v/@google-labs/graph-runner.svg?logo=npm)](https://www.npmjs.com/package/@google-labs/graph-runner)                   | Legacy library for executing boards                                                                   |
