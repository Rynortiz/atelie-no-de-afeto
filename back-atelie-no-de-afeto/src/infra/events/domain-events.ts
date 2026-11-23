export const EVENTOS = {
  PRODUTO_CRIADO: "catalogo.produto.criado",
  PRODUTO_ATUALIZADO: "catalogo.produto.atualizado",
  PRODUTO_REMOVIDO: "catalogo.produto.removido",
  ESTOQUE_ESGOTADO: "catalogo.estoque.esgotado",
} as const;

export type NomeEvento = (typeof EVENTOS)[keyof typeof EVENTOS];

export const PREFIXO_CANAL = "atelie";

export const canalDe = (evento: NomeEvento) => `${PREFIXO_CANAL}:${evento}`;

export const PADRAO_CANAL_CATALOGO = `${PREFIXO_CANAL}:catalogo.*`;

export interface EventoDeDominio<T = unknown> {
  id: string;
  nome: NomeEvento;
  ocorridoEm: string;
  correlacaoId?: string;
  dados: T;
}

export interface DadosProduto {
  produtoId: string;
  nome?: string;
  categoriaId?: string;
  preco?: number;
  estoque?: number;
}