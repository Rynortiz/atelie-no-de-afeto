import { redisSubscriber } from "../redis/redis.client";
import { cache } from "../redis/cache.service";
import { chavesCache } from "../redis/cache.keys";
import { logger } from "../../utils/logger";
import {
  EVENTOS,
  EventoDeDominio,
  DadosProduto,
  PADRAO_CANAL_CATALOGO,
} from "./domain-events";

const log = logger.com({ fluxo: "eventos", papel: "consumidor" });

type Manipulador = (evento: EventoDeDominio<DadosProduto>) => Promise<void>;

const manipuladores: Record<string, Manipulador[]> = {};

function registrar(evento: string, manipulador: Manipulador) {
  manipuladores[evento] = [...(manipuladores[evento] ?? []), manipulador];
}

const auditar: Manipulador = async (evento) => {
  log.info("AUDITORIA — mudança no catálogo", {
    evento: evento.nome,
    eventoId: evento.id,
    produtoId: evento.dados.produtoId,
    ocorridoEm: evento.ocorridoEm,
    correlacaoId: evento.correlacaoId,
  });
};

const invalidarCacheDoCatalogo: Manipulador = async (evento) => {
  const { produtoId } = evento.dados;

  await cache.del(chavesCache.produto(produtoId));
  await cache.delPorPadrao(chavesCache.padraoListaProdutos());

  log.info("Cache do catálogo invalidado por evento", {
    evento: evento.nome,
    produtoId,
    correlacaoId: evento.correlacaoId,
  });
};

const alertarEstoqueEsgotado: Manipulador = async (evento) => {
  log.warn("ALERTA — produto sem estoque", {
    produtoId: evento.dados.produtoId,
    nome: evento.dados.nome,
    correlacaoId: evento.correlacaoId,
  });
};

registrar(EVENTOS.PRODUTO_CRIADO, auditar);
registrar(EVENTOS.PRODUTO_CRIADO, invalidarCacheDoCatalogo);

registrar(EVENTOS.PRODUTO_ATUALIZADO, auditar);
registrar(EVENTOS.PRODUTO_ATUALIZADO, invalidarCacheDoCatalogo);

registrar(EVENTOS.PRODUTO_REMOVIDO, auditar);
registrar(EVENTOS.PRODUTO_REMOVIDO, invalidarCacheDoCatalogo);

registrar(EVENTOS.ESTOQUE_ESGOTADO, alertarEstoqueEsgotado);

export async function iniciarConsumidorDeEventos(): Promise<void> {
  try {
    await redisSubscriber.psubscribe(PADRAO_CANAL_CATALOGO);

    log.info("Consumidor assinando eventos", {
      padrao: PADRAO_CANAL_CATALOGO,
      eventosRegistrados: Object.keys(manipuladores),
    });

    redisSubscriber.on(
      "pmessage",
      async (_padrao: string, canal: string, mensagem: string) => {
        let evento: EventoDeDominio<DadosProduto>;

        try {
          evento = JSON.parse(mensagem);
        } catch {
          log.error("Mensagem recebida em formato inválido", { canal });
          return;
        }

        log.info("Evento recebido", {
          evento: evento.nome,
          eventoId: evento.id,
          canal,
          correlacaoId: evento.correlacaoId,
          atrasoMs: Date.now() - new Date(evento.ocorridoEm).getTime(),
        });

        const reacoes = manipuladores[evento.nome] ?? [];

        if (reacoes.length === 0) {
          log.debug("Nenhum manipulador registrado", { evento: evento.nome });
          return;
        }

        for (const reagir of reacoes) {
          try {
            await reagir(evento);
          } catch (erro) {
            log.error("Manipulador falhou", {
              evento: evento.nome,
              eventoId: evento.id,
              erro: erro instanceof Error ? erro.message : String(erro),
            });
          }
        }
      },
    );
  } catch (erro) {
    log.warn("Não foi possível assinar os canais; eventos não serão consumidos", {
      erro: erro instanceof Error ? erro.message : String(erro),
    });
  }
}