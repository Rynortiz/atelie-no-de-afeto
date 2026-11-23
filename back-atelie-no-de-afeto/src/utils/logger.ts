type Nivel = "debug" | "info" | "warn" | "error";

const NIVEIS: Record<Nivel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const nivelMinimo: number =
  NIVEIS[(process.env.LOG_LEVEL as Nivel) ?? "info"] ?? NIVEIS.info;

const emProducao = process.env.NODE_ENV === "production";

export interface ContextoLog {
  [chave: string]: unknown;
}

function escrever(nivel: Nivel, mensagem: string, contexto?: ContextoLog) {
  if (NIVEIS[nivel] < nivelMinimo) return;

  const registro = {
    ts: new Date().toISOString(),
    nivel,
    mensagem,
    ...contexto,
  };

  if (emProducao) {
    console.log(JSON.stringify(registro));
    return;
  }

  const extras = contexto && Object.keys(contexto).length > 0
    ? " " + JSON.stringify(contexto)
    : "";
  console.log(`[${registro.ts}] ${nivel.toUpperCase().padEnd(5)} ${mensagem}${extras}`);
}

export const logger = {
  debug: (mensagem: string, contexto?: ContextoLog) =>
    escrever("debug", mensagem, contexto),
  info: (mensagem: string, contexto?: ContextoLog) =>
    escrever("info", mensagem, contexto),
  warn: (mensagem: string, contexto?: ContextoLog) =>
    escrever("warn", mensagem, contexto),
  error: (mensagem: string, contexto?: ContextoLog) =>
    escrever("error", mensagem, contexto),

  com(contextoFixo: ContextoLog) {
    return {
      debug: (m: string, c?: ContextoLog) =>
        escrever("debug", m, { ...contextoFixo, ...c }),
      info: (m: string, c?: ContextoLog) =>
        escrever("info", m, { ...contextoFixo, ...c }),
      warn: (m: string, c?: ContextoLog) =>
        escrever("warn", m, { ...contextoFixo, ...c }),
      error: (m: string, c?: ContextoLog) =>
        escrever("error", m, { ...contextoFixo, ...c }),
    };
  },
};