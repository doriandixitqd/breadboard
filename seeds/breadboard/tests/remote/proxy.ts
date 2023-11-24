/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import test from "ava";
import { MockHTTPConnection } from "../helpers/_test-transport.js";
import { ProxyClient, ProxyServer } from "../../src/remote/proxy.js";
import {
  HTTPClientTransport,
  HTTPServerTransport,
} from "../../src/remote/http.js";
import {
  AnyProxyRequestMessage,
  AnyProxyResponseMessage,
} from "../../src/remote/protocol.js";
import { Board } from "../../src/board.js";
import { TestKit } from "../helpers/_test-kit.js";

test("ProxyServer can use HTTPServerTransport", async (t) => {
  const board = new Board();
  board.addKit(TestKit);

  const request = {
    body: [
      "proxy",
      { node: { id: "id", type: "noop" }, inputs: { hello: "world" } },
    ] as AnyProxyRequestMessage,
  };
  const response = {
    write: (response: unknown) => {
      const data = JSON.parse(response as string);
      t.deepEqual(data, ["proxy", { outputs: { hello: "world" } }]);
      return true;
    },
    end: () => {
      t.pass();
    },
  };
  const transport = new HTTPServerTransport(request, response);
  const server = new ProxyServer(transport);
  await server.serve(board);
});

test("End-to-end proxy works with HTTP transports", async (t) => {
  const connection = new MockHTTPConnection<AnyProxyRequestMessage>();
  connection.onRequest(async (request, response) => {
    const serverBoard = new Board();
    serverBoard.addKit(TestKit);

    const serverTransport = new HTTPServerTransport<
      AnyProxyRequestMessage,
      AnyProxyResponseMessage
    >(request, response);
    const server = new ProxyServer(serverTransport);
    await server.serve(serverBoard);
  });
  const clientTransport = new HTTPClientTransport<
    AnyProxyRequestMessage,
    AnyProxyResponseMessage
  >("http://example.com", { fetch: connection.fetch });
  const client = new ProxyClient(clientTransport);
  const result = await client.proxy(
    { id: "id", type: "reverser" },
    { hello: "world" }
  );
  t.deepEqual(result, { hello: "dlrow" });
});
