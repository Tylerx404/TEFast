import express, {
  type NextFunction,
  type Request,
  type Response,
  type Router,
} from "express";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

import { authRouter } from "./routes/auth";
import { commentsRouter } from "./routes/comments";
import { coursesRouter } from "./routes/courses";
import { enrollmentsRouter } from "./routes/enrollments";
import { examResultsRouter } from "./routes/examResults";
import { examsRouter } from "./routes/exams";
import { indexRouter } from "./routes/index";
import { lessonsRouter } from "./routes/lessons";
import { questionsRouter } from "./routes/questions";
import { uploadRouter } from "./routes/upload";
import { usersRouter } from "./routes/users";
import { vocabularyRouter } from "./routes/vocabulary";

const DEFAULT_PORT = 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

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

type RouteRegistration = {
  path: string;
  router: Router;
};

const routeRegistry: RouteRegistration[] = [
  { path: "/", router: indexRouter },
  { path: "/auth", router: authRouter },
  { path: "/users", router: usersRouter },
  { path: "/courses", router: coursesRouter },
  { path: "/lessons", router: lessonsRouter },
  { path: "/exams", router: examsRouter },
  { path: "/questions", router: questionsRouter },
  { path: "/exam-results", router: examResultsRouter },
  { path: "/vocabulary", router: vocabularyRouter },
  { path: "/comments", router: commentsRouter },
  { path: "/enrollments", router: enrollmentsRouter },
  { path: "/upload", router: uploadRouter },
];

export const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(resolve(__dirname, "../public/uploads")));
app.set("views", resolve(__dirname, "../views"));
app.set("view engine", "ejs");
app.locals.pg = env.databaseUrl
  ? new Pool({ connectionString: env.databaseUrl })
  : null;

for (const route of routeRegistry) {
  app.use(route.path, route.router);
}

app.use((request: Request, response: Response) => {
  response.status(404).json({
    message: `Route not found: ${request.method} ${request.path}`,
  });
});

app.use(
  (
    error: unknown,
    request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error("Unhandled request error", {
      method: request.method,
      path: request.path,
      error,
    });

    response.status(500).json({
      message: "Internal server error",
    });
  },
);

if (import.meta.main) {
  app.listen(env.port, env.host, () => {
    console.log(
      `${env.appName} listening on http://${env.host}:${env.port} (${env.nodeEnv})`,
    );
  });
}
