# SmartReserve

Sistema web para **gerenciar reservas** de salas, laboratórios e equipamentos em ambiente institucional. Usuários consultam disponibilidade, solicitam horários e acompanham reservas; o backend valida conflitos e persiste dados no **MongoDB**.

---

## Funcionalidades e Uso do Sistema

O *SmartReserve* oferece as seguintes capacidades:

1. *Autenticação Segura*: Login utilizando número de matrícula e senha cadastrados no sistema.
2. *Listagem e Visualização de Recursos*: Visualização de todas as salas, laboratórios e equipamentos disponíveis na instituição, com seus respectivos horários permitidos de funcionamento.
3. *Criação de Reservas sem Conflito*: Cadastro de agendamentos contendo data e hora de início e fim. O sistema bloqueia automaticamente qualquer tentativa de reserva dupla no mesmo horário e recurso.
4. *Cancelamento de Agendamentos*: Listagem histórica das reservas do usuário conectado com a opção de excluir agendamentos diretamente na interface.

## Visão geral

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Motion, date-fns |
| Backend | Node.js, Express, Mongoose |
| Banco | MongoDB (local ou Atlas) |

---

## Estrutura do repositório

```
SmartReserve/
├── backend/          # API REST
│   ├── src/
│   │   ├── config/   # Conexão MongoDB
│   │   ├── models/   # Schemas Mongoose (User, Recurso, Reserva)
│   │   ├── routes/   # Rotas da API
│   │   └── scripts/  # Seed do banco
│   └── .env.example
├── frontend/         # Interface (Vite + React)
│   ├── src/
│   └── .env.example
└── README.md
```

Use uma única pasta **`frontend`** (minúsculo) no Git para evitar conflitos de nome no Windows.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- Conta/projeto **MongoDB** (Atlas ou instância local)

---

## Configuração

### Backend

1. Entre na pasta `backend` e instale dependências:

   ```bash
   cd backend
   npm install
   ```

2. Crie o arquivo **`.env`** (use `.env.example` como base):

   ```env
   MONGODB_URI=sua_uri_mongodb
   PORT=4000
   ```

   Não commite o `.env` (credenciais ficam só na sua máquina).

### Frontend

1. Na pasta `frontend`:

   ```bash
   cd frontend
   npm install
   ```

2. Opcional: crie **`.env`** com a URL da API (padrão já é `http://localhost:4000`):

   ```env
   VITE_API_URL=http://localhost:4000
   ```

---

## Popular o banco (seed)

Cria o usuário de teste e, se não houver recursos, insere exemplos:

```bash
cd backend
npm run seed
```

**Usuário de teste (desenvolvimento):**

| Campo | Valor |
|-------|--------|
| Matrícula | `180` |
| Senha | `123456` |

---

## Executar em desenvolvimento

Abra **dois terminais**.

**Terminal 1 — API**

```bash
cd backend
npm run dev
```

API em **http://localhost:4000** (ou na porta definida em `PORT`).

**Terminal 2 — interface**

```bash
cd frontend
npm run dev
```

Interface em **http://localhost:3000** (configurado no Vite).

---

## Endpoints principais da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/login` | Login com matrícula e senha |
| `GET` | `/api/resources` | Lista recursos |
| `POST` | `/api/resources` | Cria recurso (ex.: perfil admin) |
| `GET` | `/api/reservations?usuario=<id>` | Lista reservas do usuário |
| `POST` | `/api/reservations` | Cria reserva |
| `DELETE` | `/api/reservations/:id` | Remove reserva |

---

## Build de produção (frontend)

```bash
cd frontend
npm run build
npm run preview   # testar o build localmente
```

---

## Uso Transparente de IA

Em conformidade com as diretrizes do projeto e boas práticas de Engenharia de Software, declaramos o uso de Inteligência Artificial (modelos da família Gemini) como ferramenta de auxílio durante o desenvolvimento.

Abaixo estão detalhados os principais cenários de uso da nossa equipe, acompanhados de exemplos reais de prompts aplicados por integrante:

### Contribuições de Henrique (Branch: feature/users-e-resources)

Para quê foi usada - Henrique:
- Implementação de rotas de cadastro e listagem de recursos no Express.js
- Refatoração de funções auxiliares de conversão e manipulação de tempo (horas para minutos)
- Estruturação de validações estritas de horários de funcionamento (início antes do fim e formato 24h)
- Criação de testes unitários para fluxos de falha na autenticação (senha inválida)
- Escrita de testes unitários para a rota de exclusão de reservas (DELETE)

Exemplos reais de prompts
Prompt 1

Como estruturar rotas GET e POST para cadastro de recursos no Express.js onde, caso o usuário não envie horários de funcionamento específicos no payload, o backend crie automaticamente um cronograma padrão de funcionamento de segunda a sexta-feira?

Resposta aceita: a IA forneceu uma lógica auxiliar (`montarHorarios`) para interceptar o corpo da requisição e popular a lista padrão de segunda a sexta com horário comercial se os valores específicos fossem omitidos.

Prompt 2

Como posso refatorar funções auxiliares de manipulação de horário no JavaScript para que tratem casos de borda, como aceitar strings de horários com um ou dois dígitos (ex: '9:00' ou '09:00') e converter com segurança de volta em minutos para evitar falhas de tipagem?

Resposta aceita: a IA recomendou o uso de expressões regulares flexíveis (`/^(\d{1,2}):(\d{2})$/`) e a conversão manual de base numérica (usando `parseInt` com base 10) para evitar problemas com strings contendo zeros à esquerda.

Prompt 3

Como posso criar funções puras em JavaScript para validar se uma string de horário está no formato 24h (HH:mm) e se a hora de início é anterior à hora de término? Preciso que essa lógica seja independente do banco de dados para poder testá-las isoladamente.

Resposta aceita: a IA sugeriu a criação de validadores puros (`validarFormatoHora` e `horariosSaoValidos`) retornando booleanos, permitindo que a regra de negócios de consistência horária fosse testada isoladamente antes da persistência de dados.

Prompt 4

Como posso estruturar testes unitários usando Jest e Supertest para validar o comportamento de falha na rota de login ao fornecer uma senha inválida, e também para simular e validar o sucesso e erro na rota de remoção de reservas (DELETE)?

Resposta aceita: a IA sugeriu a criação de casos de teste utilizando mocks para simular as respostas de erro do banco de dados e do Express, validando que a API respondesse com os códigos de status HTTP corretos (400 e 404).

Prompt 5

Utilizando o Jest, como posso estruturar testes unitários para validar se uma função auxiliar de rotas lança erros de forma correta ao receber horários com formato inválido ou cronologicamente inconsistentes?

Resposta aceita: a IA explicou a utilização da asserção `.toThrow()` envolvendo a chamada da função em um wrapper de callback, evitando falhas de execução precoce no fluxo principal do teste.

Dinâmica de uso
Utilizada em sessões pontuais durante o desenvolvimento da branch, servindo como suporte para validação de lógica de manipulação de datas, refatoração de funções utilitárias matemáticas e desenvolvimento de cenários de teste automatizados com Jest. Todas as sugestões de código foram adaptadas e validadas localmente pelo integrante antes do commit final.


### Contribuições de Fabio : fiz o Front-end inteiro (Branch: feat/adicionar-animacoes-no-front / refactor/popups-feedback) alem de testes para usabilidade

Dinâmica de uso

usei primeiramente o google ai studio para fazer o visual pois ela é mais afiada nisso , depois mandei pro claude sonnet 4.7 para refatorar as funções , após isso fui pedindo planos de implementação de testes e implementando eles conforme eu conferia os resultados dos mesmos , conforme a necessidade fui pedindo alterações pontuais .

usei primeiro o plan-mode em tudo , e alem disso mandava o promtp generico e pedia pro claude melhorar ele pra eu re enviar o plano 

# o que eu mandei primeiro 

os pop ups estão muito feios acho que sao os nativos do browser , use o mesmo esquema visual e faça os pop ups de operações e confirmações 

# o prompt melhorado:

Os pop-ups atuais estão usando os diálogos nativos do browser (alert, confirm, prompt). Substitua todos eles por modais customizados que sigam exatamente o mesmo esquema visual da aplicação (mesmas cores, fontes, bordas, sombras e espaçamentos já usados). Crie componentes reutilizáveis para os três tipos:

    Informação/Operação – substitui alert()
    Confirmação – substitui confirm() com botões "Confirmar" e "Cancelar"
    Input – substitui prompt() com campo de texto e botões "OK" e "Cancelar"

Os modais devem ter overlay escurecido ao fundo, animação suave de entrada, fechar ao clicar fora ou pressionar Esc, e ser totalmente responsivos.

# o plano 

# Substituir pop-ups nativos do navegador por modais customizados

## Contexto
O app (`frontend/src/App.tsx`) usa `alert()` nativo do navegador em 6 lugares para mensagens de sucesso/erro/validação, e o cancelamento de reserva (linha ~671-678) não tem nenhuma confirmação antes de excluir. Esses pop-ups nativos quebram visualmente o design do app (Tailwind + Framer Motion, cards arredondados `rounded-[32px]`, backdrop blur, etc., conforme `CreateResourceModal` em App.tsx:827-997). O objetivo é criar componentes de modal reutilizáveis que sigam o mesmo esquema visual, para:
- Mensagens de sucesso/erro/validação (substituindo `alert()`)
- Confirmação antes de ações destrutivas (cancelar reserva)

## Usos de `alert()` a substituir (todos em `frontend/src/App.tsx`)
- L151: erro de conflito de horário ao reservar
- L165: sucesso ao reservar
- L167: erro genérico ao reservar
- L184: erro genérico ao criar recurso
- L676: erro genérico ao cancelar reserva
- L849: validação de formulário no `CreateResourceModal`

## Novos componentes
Criar `frontend/src/components/FeedbackDialogs.tsx` com dois componentes seguindo o padrão visual do `CreateResourceModal` (AnimatePresence, backdrop `bg-black/40 backdrop-blur-sm`, painel `bg-white rounded-[32px] shadow-2xl`, botões `motion.button` com `whileHover`/`whileTap`):

1. **`AlertDialog`** — modal de notificação (sucesso/erro/validação) com um único botão "OK".
   - Props: `{ isOpen, onClose, type: 'success' | 'error', title?, message }`
   - Ícone via `lucide-react` (CheckCircle para success em verde/emerald, AlertCircle/XCircle para error em vermelho), seguindo as cores já usadas no app (emerald-500, red-500).

2. **`ConfirmDialog`** — modal de confirmação com botões "Cancelar" (secundário) e "Confirmar" (destrutivo, vermelho).
   - Props: `{ isOpen, onClose, onConfirm, title?, message, confirmLabel? }`

Ambos exportados e importados em `App.tsx`.

## Mudanças em `App.tsx`
1. Importar `AlertDialog` e `ConfirmDialog` de `./components/FeedbackDialogs`.
2. Adicionar estados no componente principal `App`:
   - `const [alertDialog, setAlertDialog] = useState<{type:'success'|'error', title?:string, message:string} | null>(null)`
   - `const [confirmDialog, setConfirmDialog] = useState<{message:string, onConfirm: () => void} | null>(null)`
3. Substituir cada `alert(...)` (L151, L165, L167, L184, L676) por `setAlertDialog({...})` com o `type` apropriado (success para L165, error para os demais).
4. Renderizar `<AlertDialog isOpen={!!alertDialog} ... onClose={() => setAlertDialog(null)} />` próximo de onde `CreateResourceModal` é renderizado (perto de L820).
5. Cancelamento de reserva (L668-682): trocar o `onClick` direto por abertura de `ConfirmDialog` ("Tem certeza que deseja cancelar esta reserva?"); ao confirmar, executar a lógica atual de `apiDeleteReservation` + refetch, fechando o modal. Erros desse fluxo também usam `setAlertDialog`.
6. Renderizar `<ConfirmDialog isOpen={!!confirmDialog} onConfirm={...} onClose={() => setConfirmDialog(null)} />` no mesmo lugar.

## Mudanças em `CreateResourceModal` (App.tsx:827-997)
- L849: trocar `alert('Por favor, preencha todos os campos e selecione uma foto.')` por elevar o estado de erro para o `App` via `setAlertDialog` (passar uma prop `onValidationError` ao `CreateResourceModal`, ou simplesmente mostrar a mensagem inline no próprio modal usando o mesmo padrão de erro já usado na tela de login: `<p className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl py-3 px-4">`). Optar pela versão inline (mais simples, sem precisar empilhar modais).

## Verificação
- Rodar `npm run dev` em `frontend/` e testar manualmente:
  - Reserva com conflito de horário → AlertDialog de erro
  - Reserva com sucesso → AlertDialog de sucesso
  - Criar recurso sem preencher campos → erro inline no modal
  - Cancelar reserva → ConfirmDialog antes de excluir
- Verificar `npx tsc --noEmit` para garantir tipos corretos.


### Contribuições de Vitória (Branch: feature/testes)

Para quê foi usada - Vitória:

* Criação de testes unitários para validar o comportamento das funcionalidades implementadas
* Definição de cenários de teste para casos de sucesso, falha e entradas inválidas
* Análise de erros durante a execução dos testes automatizados
* Revisão da diferença entre resultado esperado e resultado obtido nos testes
* Organização dos testes para melhorar a confiabilidade da entrega do laboratório

Exemplos reais de prompts

Prompt 1

Como posso estruturar testes unitários para validar se uma função está retornando corretamente o resultado esperado quando recebe uma entrada válida?

Resposta aceita: a IA explicou como montar casos de teste com entradas conhecidas, executar a função testada e comparar o retorno obtido com o valor esperado por meio de asserções. A orientação ajudou a organizar os testes iniciais a partir dos fluxos principais da aplicação.

Prompt 2

Um dos testes automatizados está falhando, mas a lógica da função parece estar correta. Como posso identificar se o problema está no teste ou na implementação?

Resposta aceita: a IA recomendou comparar o valor esperado com o valor realmente retornado pela função, revisar os dados usados como entrada e verificar se o teste estava coerente com a regra de negócio solicitada. Isso auxiliou na identificação de inconsistências entre a expectativa do teste e o comportamento implementado.

Prompt 3

Quais cenários devo considerar para testar uma funcionalidade além do fluxo principal, incluindo entradas inválidas e casos limite?

Resposta aceita: a IA sugeriu a criação de testes separados para entradas válidas, entradas inválidas, campos vazios, valores fora do padrão esperado e casos limite. Essa orientação contribuiu para ampliar a cobertura dos testes e validar comportamentos que poderiam não ser percebidos apenas com testes de caminho feliz.

Dinâmica de uso

Utilizada em sessões pontuais durante o desenvolvimento dos testes do laboratório de C214, servindo como apoio para definição de cenários, interpretação de falhas e revisão da lógica esperada nas funcionalidades. As sugestões foram adaptadas conforme o código do projeto e validadas localmente antes da entrega final.


---

## Equipe

Projeto acadêmico — **SmartReserve** (C14-INATEL). Consulte o repositório no GitHub para a lista atual de integrantes e contribuições.

---




