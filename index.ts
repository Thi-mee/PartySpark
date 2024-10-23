console.log("Hello via Bun!");


Bun.serve({
    development: true,
    port: 8080,
    fetch(req, server) {
      // upgrade the request to a WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
        message(ws, message) {}, // a message is received
        open(ws) {}, // a socket is opened
        close(ws, code, message) {}, // a socket is closed
        drain(ws) {}, // the socket is ready to receive more data
    }, // handlers
  });

console.log('Server started on port 8080!');














declare module "bun" {
    interface Env {
        AWESOME: string;
    }
}