import { Router } from "express";

export const indexRouter = Router();

indexRouter.get("/", (_request, response) => {
  response.json({
    service: process.env.APP_NAME ?? "tefast-backend",
    message: "TEFast backend is running",
  });
});

indexRouter.get("/health", (_request, response) => {
  response.json({
    service: process.env.APP_NAME ?? "tefast-backend",
    status: "ok",
    runtime: "bun",
    timestamp: new Date().toISOString(),
    dependencies: {
      postgres: process.env.DATABASE_URL ? "configured" : "missing",
      redis: process.env.REDIS_URL ? "configured" : "missing",
    },
  });
});