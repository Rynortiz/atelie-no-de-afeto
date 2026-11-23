import { conectarRedis, desconectarRedis, redis } from "./redis/redis.client";
import { iniciarConsumidorDeEventos } from "./events/event.subscriber";
import { logger } from "../utils/logger";

const log = logger.com({ fluxo: "bootstrap" });

export async function iniciarInfraestrutura(): Promise<void> {
  log.info("Iniciando infraestrutura de apoio");

  await conectarRedis();
  await iniciarConsumidorDeEventos();

  log.info("Infraestrutura pronta");
}

export async function encerrarInfraestrutura(): Promise<void> {
  log.info("Encerrando infraestrutura");
  await desconectarRedis();
}
export async function verificarSaude(): Promise<{
  status: "ok" | "degradado";
  redis: "conectado" | "indisponivel";
}> {
  try {
    await redis.ping();
    return { status: "ok", redis: "conectado" };
  } catch {
    return { status: "degradado", redis: "indisponivel" };
  }
}

export function registrarEncerramentoGracioso(): void {
  const encerrar = async (sinal: string) => {
    log.info("Sinal de término recebido", { sinal });
    await encerrarInfraestrutura();
    process.exit(0);
  };

  process.on("SIGTERM", () => void encerrar("SIGTERM"));
  process.on("SIGINT", () => void encerrar("SIGINT"));
}