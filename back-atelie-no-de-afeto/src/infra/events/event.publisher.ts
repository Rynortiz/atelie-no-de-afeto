import { randomUUID } from "crypto";
import { redis } from "../redis/redis.client";
import { logger } from "../../utils/logger";
import {
  EventoDeDominio,
  NomeEvento,
  canalDe,
} from "./domain-events";

const log = logger.com({ fluxo: "eventos", papel: "publicador" });

class EventPublisher {
  async publicar<T>(
    nome: NomeEvento,
    dados: T,
    correlacaoId?: string,
  ): Promise<number> {
    const evento: EventoDeDominio<T> = {
      id: randomUUID(),
      nome,
      ocorridoEm: new Date().toISOString(),
      correlacaoId,
      dados,
    };

    const canal = canalDe(nome);

    try {
      const assinantes = await redis.publish(canal, JSON.stringify(evento));

      if (assinantes === 0) {
        log.warn("Evento publicado sem assinantes — mensagem descartada", {
          evento: nome,
          eventoId: evento.id,
          canal,
          correlacaoId,
        });
      } else {
        log.info("Evento publicado", {
          evento: nome,
          eventoId: evento.id,
          canal,
          assinantes,
          correlacaoId,
          dados,
        });
      }

      return assinantes;
    } catch (erro) {
      log.error("Falha ao publicar evento", {
        evento: nome,
        eventoId: evento.id,
        erro: erro instanceof Error ? erro.message : String(erro),
        correlacaoId,
      });
      return 0;
    }
  }
}

export const eventPublisher = new EventPublisher();