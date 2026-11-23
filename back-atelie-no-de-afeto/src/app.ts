import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import path from "path";
import fs from "fs";
import { errorHandler } from "./middlewares/error.middleware";
import { requestContext } from "./middlewares/request-context.middleware";
import {
  iniciarInfraestrutura,
  registrarEncerramentoGracioso,
  verificarSaude,
} from "./infra/bootstrap";

const app = express();

const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.json());

app.use(requestContext);

app.get("/health", async (_req, res) => {
  const saude = await verificarSaude();

  res.status(200).json({
    status: saude.status,
    servicos: {
      api: "ok",
      redis: saude.redis,
    },
    mensagem:
      saude.status === "ok"
        ? "API Nós de Afeto funcionando."
        : "API funcionando sem cache; consultas servidas direto do banco.",
  });
});

app.use("/api", routes);

app.use(errorHandler);

void iniciarInfraestrutura();
registrarEncerramentoGracioso();

export default app;
