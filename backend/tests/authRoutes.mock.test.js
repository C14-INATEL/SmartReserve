/**
 * Dois testes unitários distintos com mock da mesma dependência (User.findOne):
 * 1) Credencial incorreta — findOne resolve com usuário; senha diferente → HTTP 401.
 * 2) Falha na persistência/consulta — findOne rejeita → HTTP 500 (erro tratado pela rota).
 */
import request from "supertest";
import express from "express";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockFindOne = jest.fn();

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: {
    findOne: mockFindOne,
  },
}));

const { default: authRoutes } = await import("../src/routes/authRoutes.js");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  return app;
}

describe("Rotas de autenticação — 2 testes unitários distintos com mock de User.findOne", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar 401 quando a senha não confere com o usuário encontrado", async () => {
    mockFindOne.mockResolvedValue({
      _id: { toString: () => "507f1f77bcf86cd799439011" },
      nome: "Aluno Teste",
      matricula: "180",
      senha: "123456",
      role: "user",
    });

    const app = createApp();
    const res = await request(app)
      .post("/auth/login")
      .send({ matricula: "180", senha: "senha-incorreta" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Matrícula ou senha incorretas");
    expect(mockFindOne).toHaveBeenCalledWith({ matricula: "180" });
  });

  test("deve retornar 500 quando findOne falhar (simula erro de banco/API)", async () => {
    mockFindOne.mockRejectedValue(new Error("Falha na conexão com o banco"));

    const app = createApp();
    const res = await request(app)
      .post("/auth/login")
      .send({ matricula: "180", senha: "123456" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Erro ao autenticar");
    expect(res.body.error).toBe("Falha na conexão com o banco");
  });
});
