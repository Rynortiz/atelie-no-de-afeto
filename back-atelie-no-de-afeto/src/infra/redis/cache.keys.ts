const RAIZ = "atelie";
const CATALOGO = `${RAIZ}:catalogo`;

function assinatura(parametros: Record<string, unknown>): string {
  return Object.keys(parametros)
    .sort()
    .map((chave) => `${chave}=${String(parametros[chave] ?? "")}`)
    .join("&");
}

export const chavesCache = {
  produto: (id: string) => `${CATALOGO}:produto:${id}`,

  listaProdutos: (parametros: Record<string, unknown>) =>
    `${CATALOGO}:produtos:${assinatura(parametros)}`,

  padraoListaProdutos: () => `${CATALOGO}:produtos:*`,

  padraoCatalogo: () => `${CATALOGO}:*`,
};

export const TTL = {
  listaProdutos: 300,
  produto: 600,
};