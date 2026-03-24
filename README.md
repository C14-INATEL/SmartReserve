# SmartReserve

Sistema web para **gerenciar reservas** de salas, laboratórios e equipamentos em ambiente institucional. Usuários consultam disponibilidade, solicitam horários e acompanham reservas; o backend valida conflitos e persiste dados no **MongoDB**.

---

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

## Equipe

Projeto acadêmico — **SmartReserve** (C14-INATEL). Consulte o repositório no GitHub para a lista atual de integrantes e contribuições.

---

