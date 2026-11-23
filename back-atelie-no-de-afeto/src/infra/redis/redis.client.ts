import Redis, { RedisOptions } from "ioredis";
import { logger } from "../../utils/logger";

const log = logger.com({ fluxo: "redis" });

const REDIS_URL = process.env.REDIS_URL ?? "redis://redis:6379";

const opcoes: RedisOptions = {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 2000,
  commandTimeout: 1000,
  retryStrategy: (tentativa: number) => Math.min(tentativa * 200, 5000),
  lazyConnect: true,
};


export const redis = new Redis(REDIS_URL, opcoes);

export const redisSubscriber = new Redis(REDIS_URL, opcoes);

let disponivel = false;

export const redisDisponivel = () => disponivel;

function instrumentar(cliente: Redis, papel: string) {
  cliente.on("connect", () => {
    log.info("Conexão estabelecida", { papel });
  });

  cliente.on("ready", () => {
    if (papel === "comandos") disponivel = true;
    log.info("Cliente pronto", { papel });
  });

  cliente.on("error", (erro: Error) => {
    if (papel === "comandos") disponivel = false;
    log.warn("Falha na conexão com o Redis", { papel, erro: erro.message });
  });

  cliente.on("close", () => {
    if (papel === "comandos") disponivel = false;
    log.warn("Conexão encerrada", { papel });
  });
}

instrumentar(redis, "comandos");
instrumentar(redisSubscriber, "assinatura");

export async function conectarRedis(): Promise<void> {
  try {
    await Promise.all([redis.connect(), redisSubscriber.connect()]);
  } catch (erro) {
    log.warn("Não foi possível conectar na subida; seguindo sem cache", {
      erro: erro instanceof Error ? erro.message : String(erro),
    });
  }
}

export async function desconectarRedis(): Promise<void> {
  await Promise.allSettled([redis.quit(), redisSubscriber.quit()]);
  log.info("Conexões encerradas");
}