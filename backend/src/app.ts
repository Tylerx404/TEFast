import { env } from "./config/env";
import { getHealthResponse } from "./modules/health/health.controller";
import { json } from "./shared/http/json";

type RouteHandler = () => Response;

const routes = new Map<string, RouteHandler>([
  [
    "GET /",
    () =>
      json({
        service: env.appName,
        message: "TEFast backend is running",
      }),
  ],
  ["GET /health", getHealthResponse],
]);

export function app(request: Request): Response {
  const url = new URL(request.url);
  const routeKey = `${request.method.toUpperCase()} ${url.pathname}`;
  const routeHandler = routes.get(routeKey);

  if (!routeHandler) {
    return json(
      {
        message: `Route not found: ${routeKey}`,
      },
      { status: 404 },
    );
  }

  try {
    return routeHandler();
  } catch (error) {
    console.error("Unhandled request error", {
      route: routeKey,
      error,
    });

    return json(
      {
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
