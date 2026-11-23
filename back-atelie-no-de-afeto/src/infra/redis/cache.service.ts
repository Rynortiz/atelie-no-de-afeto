import { redis } from "./redis.client";
import { logger } from "../../utils/logger";

const log = logger.com({ fluxo: "cache" });

class CacheService {
  async get<T>(chave: string): Promise<T | null> {
    try {
      const bruto = await redis.get(chave);

      if (bruto === null) {
        log.debug("MISS", { chave });
        return null;
      }

      log.debug("HIT", { chave });
      return JSON.parse(bruto) as T;
    } catch (erro) {
      log.warn("Leitura falhou; seguindo para a fonte", {
        chave,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
      return null;
    }
  }

  async set(chave: string, valor: unknown, ttlSegundos: number): Promise<void> {
    try {
      await redis.set(chave, JSON.stringify(valor), "EX", ttlSegundos);
      log.debug("Gravado", { chave, ttl: ttlSegundos });
    } catch (erro) {
      log.warn("Gravação falhou; o dado segue válido sem cache", {
        chave,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }

  async getOrSet<T>(
    chave: string,
    ttlSegundos: number,
    buscarNaFonte: () => Promise<T>,
  ): Promise<T> {
    const emCache = await this.get<T>(chave);
    if (emCache !== null) return emCache;

    const inicio = Date.now();
    const dado = await buscarNaFonte();
    const duracao = Date.now() - inicio;

    log.info("Consultado na fonte e armazenado", {
      chave,
      duracaoMs: duracao,
    });

    await this.set(chave, dado, ttlSegundos);
    return dado;
  }

  async del(chave: string): Promise<void> {
    try {
      const removidas = await redis.del(chave);
      log.info("Chave invalidada", { chave, removidas });
    } catch (erro) {
      log.warn("Invalidação falhou", {
        chave,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
    }
  }

  async delPorPadrao(padrao: string): Promise<number> {
    let removidas = 0;

    try {
      let cursor = "0";

      do {
        const [proximoCursor, chaves] = await redis.scan(
          cursor,
          "MATCH",
          padrao,
          "COUNT",
          100,
        );
        cursor = proximoCursor;

        if (chaves.length > 0) {
          await redis.unlink(...chaves);
          removidas += chaves.length;
        }
      } while (cursor !== "0");

      log.info("Padrão invalidado", { padrao, removidas });
    } catch (erro) {
      log.warn("Invalidação por padrão falhou", {
        padrao,
        erro: erro instanceof Error ? erro.message : String(erro),
      });
    }

    return removidas;
  }
}

export const cache = new CacheService();