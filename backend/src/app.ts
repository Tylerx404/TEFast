type RouteHandler = () => Response;

const DEFAULT_PORT = 3001;

function readNumber(
  name: string,
  value: string | undefined,
  fallback: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new Error(`Invalid numeric environment value for ${name}: ${value}`);
  }

  return parsedValue;
}

const env = {
  appName: process.env.APP_NAME ?? "tefast-backend",
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: readNumber("PORT", process.env.PORT, DEFAULT_PORT),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
};

function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers();

  if (init.headers instanceof Headers) {
    init.headers.forEach((value, key) => headers.set(key, value));
  } else if (Array.isArray(init.headers)) {
    for (const [key, value] of init.headers) {
      headers.set(key, value);
    }
  } else if (init.headers) {
    for (const [key, value] of Object.entries(init.headers)) {
      if (typeof value === "string") {
        headers.set(key, value);
      }
    }
  }

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

const routeHandlers = new Map<string, RouteHandler>([
  [
    "GET /",
    () =>
      json({
        service: env.appName,
        message: "TEFast backend is running",
      }),
  ],
  [
    "GET /health",
    () =>
      json({
        service: env.appName,
        status: "ok",
        runtime: "bun",
        timestamp: new Date().toISOString(),
        dependencies: {
          postgres: env.databaseUrl ? "configured" : "missing",
          redis: env.redisUrl ? "configured" : "missing",
        },
      }),
  ],
]);

export function app(request: Request): Response {
  const url = new URL(request.url);
  const routeKey = `${request.method.toUpperCase()} ${url.pathname}`;
  const routeHandler = routeHandlers.get(routeKey);

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

if (import.meta.main) {
  const server = Bun.serve({
    fetch: app,
    hostname: env.host,
    port: env.port,
  });

  console.log(
    `${env.appName} listening on http://${server.hostname}:${server.port} (${env.nodeEnv})`,
  );
}
