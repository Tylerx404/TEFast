import { env } from "../../config/env";
import { json } from "../../shared/http/json";

export function getHealthResponse(): Response {
  return json({
    service: env.appName,
    status: "ok",
    runtime: "bun",
    timestamp: new Date().toISOString(),
    dependencies: {
      postgres: env.databaseUrl ? "configured" : "missing",
      redis: env.redisUrl ? "configured" : "missing",
    },
  });
}
