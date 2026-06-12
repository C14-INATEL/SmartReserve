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

---

## Equipe

Projeto acadêmico — **SmartReserve** (C14-INATEL). Consulte o repositório no GitHub para a lista atual de integrantes e contribuições.

---




