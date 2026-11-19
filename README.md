# Carl Sagan AI — Explorador do Universo 3D

Plataforma científica com uma **galáxia 3D interativa** (Three.js) e um **chatbot de IA** inspirado no estilo de divulgação científica de Carl Sagan. Inclui cadastro, login, dashboard, painel de informações dos corpos celestes e histórico de conversas por usuário, com banco SQLite.

## Objetivos

- Explorar uma galáxia espiral e o Sistema Solar em 3D, com seleção de objetos e painel lateral de dados.
- Conversar com uma IA de respostas **curtas, objetivas e precisas**, com controle de tokens.
- Entregar um produto completo, que roda em qualquer computador com Node.js.

## Honestidade científica

- Os objetos catalogados (Sol, planetas, Lua, Sirius, Betelgeuse, Sagitário A\*, Andrômeda etc.) são **reais**, com dados arredondados (`src/data/celestialObjects.js`).
- **Posições, distâncias entre objetos e tamanhos na cena são ilustrativos.** Estrelas de fundo, poeira, nebulosas decorativas, o traçado dos braços da galáxia, o cinturão de asteroides e as texturas dos planetas são elementos artísticos gerados proceduralmente, e a interface avisa isso.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Vite, JavaScript ES Modules, Three.js, React Three Fiber, @react-three/drei, Framer Motion, Lucide React, React Router |
| Backend | Node.js **nativo** (módulo `http`), APIs REST, ES Modules. **Sem Express** (nem como dependência indireta) |
| Banco | SQLite via módulo nativo `node:sqlite` (sem dependências de compilação) |
| Segurança | scrypt para senhas, sessões com cookie HttpOnly (+ Secure em produção, SameSite=Lax), checagem de Origin, limite de requisições, CSP e cabeçalhos de segurança |
| IA | Serviço independente com provedores: Anthropic, OpenAI e qualquer API compatível com OpenAI |

O servidor não tem nenhuma dependência npm: todas as dependências do `package.json` são do frontend.

## Estrutura de pastas

```
carl-sagan-ai/
├── public/                  arquivos estáticos (favicon, assets, textures, models, fonts)
├── server/
│   ├── server.js            servidor HTTP nativo, roteamento e arquivos estáticos
│   ├── routes/              tabela de rotas
│   ├── controllers/         auth, chat e sistema
│   ├── services/            senha, sessão e IA (services/ai/*: um adaptador por provedor)
│   ├── database/            conexão SQLite, esquema e repositórios
│   ├── middleware/          autenticação e segurança
│   ├── config/              env.js e systemPrompt.js (personalidade do chatbot)
│   ├── utils/               http, validação, rate limit, estáticos
│   ├── tests/               testes de integração do backend
│   └── data/                banco SQLite (criado automaticamente)
├── src/
│   ├── components/          TopBar, painéis, chat, modais
│   ├── pages/               Login, Cadastro, Dashboard
│   ├── layouts/             AuthLayout
│   ├── three/               cena 3D: galáxia, sistema solar, câmera, shaders, qualidade
│   ├── hooks/ contexts/ services/ utils/ data/ styles/
├── scripts/dev.js           sobe backend + frontend juntos
├── .env.example
├── package.json  vite.config.js  index.html
```

## Requisitos

- **Node.js 22.13 ou superior** (recomendado: a versão LTS mais recente). O SQLite embutido (`node:sqlite`) exige essa versão.
- Um navegador moderno com WebGL (Chrome, Edge, Firefox, Safari).

### Instalando o Node.js

Baixe em <https://nodejs.org> (versão LTS) ou use um gerenciador de versões:

```bash
# Linux/macOS (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
nvm install --lts
# Windows: instale o instalador oficial ou use "winget install OpenJS.NodeJS.LTS"
node -v   # deve mostrar v22.13 ou maior
```

## Instalação

```bash
cd carl-sagan-ai
npm install
cp .env.example .env      # Windows (cmd): copy .env.example .env
```

## Configuração da IA

O chatbot só responde com uma **chave de API real**. Sem chave, o app funciona normalmente (galáxia, login, painéis) e o chat mostra um aviso claro; nenhuma resposta é simulada.

Edite o `.env` e escolha **um** provedor:

**Anthropic (padrão)**
```
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sua-chave
# AI_MODEL=claude-haiku-5-5   (padrão; altere se quiser outro modelo)
```

**OpenAI**
```
AI_PROVIDER=openai
OPENAI_API_KEY=sua-chave
# AI_MODEL=gpt-4o-mini        (padrão)
```

**Compatível com OpenAI (Groq, OpenRouter, Ollama, LM Studio...)**
```
AI_PROVIDER=openai-compatible
AI_BASE_URL=http://localhost:11434/v1
AI_MODEL=nome-do-modelo
AI_API_KEY=sua-chave          # ou AI_REQUIRE_KEY=false para servidores locais sem chave
```

A chave fica somente no servidor (variável de ambiente) e nunca vai para o navegador. Reinicie o servidor após alterar o `.env`.

### Controle de tokens e personalidade

- Respostas curtas por padrão: `AI_MAX_TOKENS=300`. Pedidos como "explique em detalhes" ou "aprofunde" usam `AI_MAX_TOKENS_LONG=900`.
- Contexto enxuto: só as últimas `AI_HISTORY_LIMIT=8` mensagens (cada uma truncada em 1.500 caracteres) são enviadas.
- Temperatura `AI_TEMPERATURE=0.4` (deixe vazio para não enviar o parâmetro).
- O título da conversa vem da primeira pergunta, sem chamada extra à IA.
- Se a resposta for cortada pelo limite, a frase incompleta final é removida.
- Falhas de rede e erros 5xx têm uma nova tentativa; timeout configurável (`AI_TIMEOUT_MS`); erros 401/429 viram mensagens claras para o usuário. Limite de mensagens por usuário: `CHAT_RATE_LIMIT_PER_MIN`.
- **O prompt de sistema (personalidade e regras de brevidade) fica em `server/config/systemPrompt.js`.** Edite o texto e reinicie o servidor.
- Para adicionar outro provedor, crie um adaptador em `server/services/ai/` com a mesma assinatura e registre-o em `server/services/ai/index.js`.

## Executando

### Desenvolvimento (backend + frontend juntos)

```bash
npm run dev
```

Abra <http://localhost:5173>. O Vite encaminha `/api` para o backend em `http://127.0.0.1:3001`.

Separadamente, se preferir: `npm run dev:server` e `npm run dev:client` em dois terminais.

### Produção

```bash
npm run build     # gera a pasta dist/
npm start         # servidor Node serve a API e o frontend em http://127.0.0.1:3001
```

Em produção defina `NODE_ENV=production` no `.env` e use **HTTPS** (atrás de um proxy reverso). Com `COOKIE_SECURE=auto`, o cookie de sessão passa a ser `Secure`. Se usar proxy reverso confiável, defina `TRUST_PROXY=true` e `HOST=0.0.0.0` conforme necessário.

### Testes do backend

```bash
npm test
```

Cobrem cadastro, validações, e-mail duplicado, hash de senha, login, logout, sessão, isolamento entre usuários, histórico persistente, limites de tokens, erro sem chave de API e cabeçalhos de segurança. A integração com a IA é testada contra um **servidor simulado local** apenas para validar o código (formato da requisição, cabeçalhos, limites); nenhuma API real é chamada nos testes.

## Usando a plataforma

1. **Cadastro** (`/cadastro`): nome, e-mail, senha (mínimo 8, com letras e números) e confirmação. **Login** (`/login`). A sessão dura 7 dias; **Sair** fica no menu da conta.
2. **Galáxia**: arraste para girar 360°, role (ou pince no celular) para aproximar/afastar, clique em um objeto para a câmera voar até ele e abrir o painel lateral com nome, categoria, descrição, distância, dimensões, temperatura, composição, informações científicas e curiosidades.
3. **Navegação**: botão **Explorar** (lista e busca de objetos), **Visão geral** (volta à câmera inicial), alternância **Galáxia / Sistema Solar** (o painel do Sol tem o botão "Entrar no Sistema Solar"). `Esc` fecha o painel.
4. **Qualidade gráfica** (ícone de medidor): Automática, Alta, Média ou Baixa. No modo automático, a qualidade é escolhida pelo dispositivo e reduzida sozinha se o FPS cair.
5. **Carl Sagan AI**: abre o chat sem reiniciar a galáxia. Enter envia, Shift+Enter quebra a linha. Há histórico de conversas (ícone de relógio), nova conversa (+) e exclusão com confirmação. O botão "Perguntar ao Carl" no painel de um objeto pré-preenche a pergunta.

## Solução de problemas

| Problema | Solução |
| --- | --- |
| `No such built-in module: node:sqlite` | Atualize o Node.js para 22.13+ (`node -v`). |
| Aviso "SQLite is an experimental feature" | Esperado em algumas versões; os scripts já o ocultam. |
| Chat mostra "IA não configurada" | Preencha a chave no `.env` e reinicie o servidor. |
| Erro "chave de API inválida" | Confira a chave e o `AI_PROVIDER`. |
| Tela preta/"Não foi possível iniciar o gráfico 3D" | Habilite a aceleração de hardware/WebGL no navegador; use "Recarregar a cena". |
| Cena lenta | Escolha qualidade **Baixa** no menu de qualidade. |
| `Frontend não compilado` ao abrir a porta 3001 | Rode `npm run build` (ou use `npm run dev` e abra a porta 5173). |
| Login não persiste em produção | Use HTTPS (cookie `Secure`) ou `COOKIE_SECURE=false` apenas para testes locais em HTTP. |
| Porta ocupada | Altere `PORT` no `.env` (e o alvo do proxy em `vite.config.js`). |
| Quer zerar os dados | Pare o servidor e apague `server/data/carl-sagan.db*`. |
