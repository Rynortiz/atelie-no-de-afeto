import client from '../api/client';

/**
 * Converte o caminho de imagem devolvido pela API em uma URL que o
 * dispositivo consegue carregar.
 *
 * O backend grava caminhos relativos (`/uploads/arquivo.jpg`) porque há dois
 * clientes com necessidades incompatíveis: o navegador alcança o servidor
 * por `meuapp.local`, enquanto o emulador Android usa `10.0.2.2` e um
 * aparelho físico usa `localhost` com `adb reverse`. Qualquer URL absoluta
 * gravada no banco quebraria pelo menos um deles.
 *
 * No navegador o caminho relativo se resolve sozinho. No React Native não:
 * `<Image source={{ uri: '/uploads/foto.jpg' }} />` não carrega nada. Então
 * a resolução acontece aqui, usando a mesma base que o cliente HTTP já usa
 * para falar com a API — assim trocar entre emulador e aparelho físico
 * continua sendo mudança de um lugar só, em config.js.
 */
export function resolveImageUrl(caminho) {
  if (!caminho) return null;

  // URL absoluta (registro antigo ou imagem externa): usa como veio.
  if (/^https?:\/\//i.test(caminho)) return caminho;

  const base = client.defaults.baseURL ?? '';

  // A base do cliente aponta para a API (".../api"), mas os arquivos são
  // servidos na raiz (".../uploads"), um nível acima.
  const raiz = base.replace(/\/api\/?$/, '');

  const relativo = caminho.startsWith('/') ? caminho : `/${caminho}`;

  return `${raiz}${relativo}`;
}