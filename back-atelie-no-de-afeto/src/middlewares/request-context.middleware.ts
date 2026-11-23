import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { armazenamentoDeContexto } from "../infra/request-context";
import { logger } from "../utils/logger";

const log = logger.com({ fluxo: "http" });

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const correlacaoId =
    (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();

  res.setHeader("x-correlation-id", correlacaoId);

  armazenamentoDeContexto.run({ correlacaoId }, () => {
    const inicio = Date.now();

    log.info("Requisição recebida", {
      metodo: req.method,
      rota: req.originalUrl,
      correlacaoId,
    });

    res.on("finish", () => {
      const duracaoMs = Date.now() - inicio;
      const nivel =
        res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

      log[nivel]("Requisição concluída", {
        metodo: req.method,
        rota: req.originalUrl,
        status: res.statusCode,
        duracaoMs,
        correlacaoId,
      });
    });

    next();
  });
}