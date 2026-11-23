# Aplicativo móvel — Ateliê Nós de Afeto

Aplicativo Android em React Native CLI que consome a mesma API do site.
Atende dois perfis na mesma base de código: o cliente navega pela vitrine, e
a administradora gerencia o catálogo.

---

## Instalação

```bash
cd mobile-atelie
npm install
```

As dependências já estão declaradas no `package.json`. Para referência, as
principais:

| Pacote | Para quê |
|---|---|
| `@react-navigation/native` e `native-stack` | navegação entre telas |
| `react-native-screens`, `react-native-safe-area-context` | suporte nativo à navegação |
| `@react-native-async-storage/async-storage` | persistência da sessão |
| `axios` | cliente HTTP |
| `react-native-image-picker` | câmera e galeria no formulário de produto |

> O AsyncStorage na versão 3 renomeou `multiSet` e `multiRemove` para
> `setMany` e `removeMany`. O `AuthContext` usa `setItem` e `removeItem`
> individuais, que funcionam nas duas versões.

---

## Endereço da API

Configurado em `src/api/config.js`. Depende de onde o app vai rodar, e os
dois casos são mutuamente exclusivos:

| Alvo | Host | O que mais é preciso |
|---|---|---|
| Emulador Android | `http://10.0.2.2:3333` | nada |
| Aparelho por USB | `http://localhost:3333` | `adb reverse tcp:3333 tcp:3333` |

`10.0.2.2` é o alias que o emulador usa para alcançar a máquina
hospedeira — `localhost` ali dentro apontaria para o próprio dispositivo
virtual. Em um aparelho físico, o `adb reverse` encaminha a porta pelo cabo,
e aí `localhost` passa a valer.

Trocar de alvo exige editar esse arquivo. É o tipo de detalhe fácil de
esquecer: o sintoma é "Não foi possível conectar ao servidor" com a API
funcionando normalmente no navegador.

---

## Subir a API

Na raiz do repositório, com a sobreposição que publica a porta:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
curl http://localhost:3333/api/products
```

O arquivo padrão mantém o backend isolado na rede interna; a exposição é
opt-in de propósito.

---

## Rodar

```bash
npx react-native start        # terminal 1 — Metro
npx react-native run-android  # terminal 2
```

Com emulador e aparelho conectados ao mesmo tempo, escolha o alvo:

```bash
adb devices
npx react-native run-android --device=emulator-5554
```

---

## Dois passos que exigem recompilação

Fonte e permissão de câmera são recursos nativos — recarregar o Metro não
basta. Os guias completos estão em `FONTE.md` e `IMAGEM.md`.

### Tipografia da marca

Baixe a [Dancing Script](https://fonts.google.com/specimen/Dancing+Script) e
coloque os arquivos da pasta `static/` em `assets/fonts/`:

```
assets/fonts/DancingScript-Bold.ttf
assets/fonts/DancingScript-SemiBold.ttf
```

O arquivo com `VariableFont` no nome não serve — o Android não lida bem com
fontes variáveis aqui. Depois:

```bash
npx react-native-asset
npx react-native run-android
```

Sem a fonte instalada o app não quebra: o nome aparece em uma fonte do
sistema.

### Câmera

Em `android/app/src/main/AndroidManifest.xml`, dentro de `<manifest>`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

A permissão em tempo de execução já é solicitada pelo componente. A galeria
não precisa de permissão: o seletor do sistema devolve apenas o arquivo
escolhido.

---

## Tráfego HTTP em desenvolvimento

O Android bloqueia tráfego em texto puro por padrão. O arquivo
`android/app/src/main/res/xml/network_security_config.xml` libera apenas
`10.0.2.2` e `localhost`, e o manifesto o referencia:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

Se o arquivo estiver ausente mas referenciado, o build falha no
`processDebugResources` com erro de resource linking.

---

## O que o app faz

**Sem sessão.** Entrar e criar conta. O cadastro valida o CPF pelos dígitos
verificadores, aplica máscara na exibição e envia somente dígitos. Ao
concluir, autentica automaticamente — o endpoint de cadastro não devolve
token, então o login é encadeado.

**Cliente.** Vitrine em grade de duas colunas com foto em proporção 1:1,
filtro por categoria e página de detalhe da peça. Produto sem estoque exibe
o selo antes de ser aberto.

**Administradora.** Listagem em modo de gestão, com estoque e ações; cadastro
e edição de produtos; envio da foto por câmera ou galeria. As ações de
escrita são verificadas no servidor — esconder o botão não é controle de
acesso.

---

## Estrutura

```
src/
├── api/
│   ├── config.js          host da API por plataforma
│   ├── client.js          axios com token e tradução de erro
│   ├── authService.js
│   ├── productService.js
│   ├── categoryService.js
│   └── uploadService.js
├── components/
│   ├── BrandHeader.js     marca e ornamentos das telas de acesso
│   ├── Button.js
│   ├── CategoryFilter.js
│   ├── ImagePickerField.js
│   ├── ProductCard.js     vitrine e gestão, por variante
│   ├── StateViews.js      carregando, vazio e erro
│   └── TextField.js
├── contexts/
│   └── AuthContext.js     fonte única da sessão
├── navigation/
│   └── AppNavigator.js    pilha pública e privada
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── ProductListScreen.js
│   ├── ProductDetailScreen.js
│   └── ProductFormScreen.js
├── theme/
│   └── theme.js           cores, espaçamentos, tipografia, sombras
└── utils/
    ├── validators.js      CPF, e-mail, formulários
    ├── formatters.js      moeda, CPF, telefone
    └── imageUrl.js        resolve o caminho relativo da API
```

As telas privadas não são registradas enquanto não há sessão — a rota não
existe, em vez de existir e estar escondida.

---

## Credenciais

| Perfil | E-mail | Senha |
|---|---|---|
| Administradora | `admin@nosdeafeto.com` | `Admin123` |
| Cliente | crie pelo próprio app | — |

---

## Problemas conhecidos

**"Não foi possível conectar ao servidor".** O host em `config.js` não
corresponde ao alvo, ou a API não está publicando a porta 3333. Confira com
`docker compose ps` se o backend mostra `0.0.0.0:3333->3333/tcp`.

**Imagens não carregam.** A API grava caminhos relativos
(`/uploads/foto.jpg`), e o `resolveImageUrl` os converte usando a base do
cliente HTTP. Se as imagens aparecem no site mas não no app, verifique se as
telas estão usando esse helper.

**Build falha com caminho longo demais.** O compilador C++ embute o caminho
completo no nome dos arquivos objeto e estoura o limite do Windows. Mova o
projeto para um caminho curto, como `C:\dev\`.

**Build falha com caracteres estranhos no caminho.** O Gradle lê mal acentos
em nomes de pasta. Renomeie removendo os acentos e limpe
`android/.gradle` e `android/build`.