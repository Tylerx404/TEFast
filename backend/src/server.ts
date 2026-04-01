import { app } from "./app";
import { env } from "./config/env";

const server = Bun.serve({
  fetch: app,
  hostname: env.host,
  port: env.port,
});

console.log(
  `${env.appName} listening on http://${server.hostname}:${server.port} (${env.nodeEnv})`,
);
