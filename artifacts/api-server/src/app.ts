import express, { type Express } from "express";
import cors from "cors";
import * as _pinoHttpModule from "pino-http";
import type { Options, HttpLogger } from "pino-http";
import type { IncomingMessage, ServerResponse } from "http";
import router from "./routes";
import { logger } from "./lib/logger";

type PinoHttpFn = (opts?: Options) => HttpLogger;
const pinoHttp = (
  typeof (_pinoHttpModule as unknown as { default?: unknown }).default === "function"
    ? (_pinoHttpModule as unknown as { default: PinoHttpFn }).default
    : (_pinoHttpModule as unknown as PinoHttpFn)
);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: unknown }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
