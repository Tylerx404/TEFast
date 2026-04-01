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

export const env = {
  appName: process.env.APP_NAME ?? "tefast-backend",
  nodeEnv: process.env.NODE_ENV ?? "development",
  host: process.env.HOST ?? "0.0.0.0",
  port: readNumber("PORT", process.env.PORT, DEFAULT_PORT),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
};
