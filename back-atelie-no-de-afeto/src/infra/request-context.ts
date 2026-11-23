import { AsyncLocalStorage } from "async_hooks";

export interface ContextoRequisicao {
  correlacaoId: string;
  usuarioId?: string;
  papel?: string;
}

export const armazenamentoDeContexto =
  new AsyncLocalStorage<ContextoRequisicao>();

export const contextoAtual = (): ContextoRequisicao | undefined =>
  armazenamentoDeContexto.getStore();

export const correlacaoAtual = (): string | undefined =>
  contextoAtual()?.correlacaoId;