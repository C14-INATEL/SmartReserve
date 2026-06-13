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

## Pipeline Jenkins

O projeto possui um `Jenkinsfile` configurado para:

- instalar as dependências do backend;
- executar os testes do backend;
- instalar as dependências do frontend;
- gerar o build de produção do frontend;
- limpar o workspace ao final da execução.

Para executar a pipeline no Jenkins, é necessário ter os seguintes plugins instalados:

- NodeJS Plugin
- Workspace Cleanup Plugin

Também é necessário configurar uma instalação do Node.js no Jenkins com o nome `NodeJS`.

Caminho no Jenkins:

```text
Manage Jenkins > Tools > NodeJS installations
```

O nome configurado deve ser exatamente:

```text
NodeJS
```

A limpeza do workspace é feita com:

```groovy
cleanWs()
```

Esse comando limpa apenas o workspace usado pelo job no Jenkins, evitando que arquivos de execuções anteriores interfiram nas próximas execuções.

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


### Contribuições de Fabio (Branch: feat/adicionar-animacoes-no-front / refactor/popups-feedback)

Dinâmica de uso:
Usei primeiro o Google AI Studio pra fazer o visual, porque achei que ele é mais afiado nisso. Depois mandei o código pro Claude Sonnet pra refatorar as funções e deixar mais limpo. A partir daí fui pedindo planos de implementação dos testes e executando conforme ia conferindo os resultados, pedindo ajustes pontuais quando algo não funcionava como esperado. Uma coisa que funcionou bem foi usar o plan-mode antes de qualquer coisa, e quando o prompt ficava muito genérico eu pedia pro próprio Claude melhorar ele antes de mandar o plano de verdade.

Para quê foi usada:
- Desenvolvimento completo do frontend (React, TypeScript, Tailwind CSS, animações com Motion)
- Substituição dos pop-ups nativos do browser por modais customizados integrados ao design do sistema
- Planejamento e implementação de testes de usabilidade com Playwright
- Refinamento iterativo de prompts para geração de planos de implementação mais precisos

Prompt 1 — versão inicial (antes do refinamento)

Os pop-ups estão muito feios, acho que são os nativos do browser. Use o mesmo esquema visual e faça os pop-ups de operações e confirmações.

Prompt 2 — versão refinada (após pedir ao Claude para melhorar o prompt)

Os pop-ups atuais estão usando os diálogos nativos do browser (alert, confirm). Substitua todos eles por modais customizados que sigam exatamente o mesmo esquema visual da aplicação (mesmas cores, fontes, bordas, sombras e espaçamentos já usados). Crie componentes reutilizáveis para dois tipos: Informação/Operação — substitui `alert()`, e Confirmação — substitui `confirm()` com botões "Confirmar" e "Cancelar". Os modais devem ter overlay escurecido ao fundo, animação suave de entrada, fechar ao clicar fora ou pressionar Esc, e ser totalmente responsivos.

Plano gerado: 
a IA gerou um plano detalhado de implementação identificando os 6 pontos de uso de `alert()` no `App.tsx`, propôs a criação do arquivo `frontend/src/components/FeedbackDialogs.tsx` com os componentes `AlertDialog` e `ConfirmDialog`, e descreveu as mudanças de estado necessárias no componente principal, incluindo os novos estados `alertDialog` e `confirmDialog` com seus respectivos tipos TypeScript.



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
