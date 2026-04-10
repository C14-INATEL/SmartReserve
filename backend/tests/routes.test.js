// tests/routes.test.js
import request from "supertest";
import express from "express";
import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockUser = {
  findOne: jest.fn()
};

const mockReserva = {
  find: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn()
};

const mockRecurso = {
  find: jest.fn(),
  create: jest.fn()
};

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: mockUser
}));

jest.unstable_mockModule("../src/models/Reserva.js", () => ({
  default: mockReserva
}));

jest.unstable_mockModule("../src/models/Recurso.js", () => ({
  default: mockRecurso
}));

const { default: authRoutes } = await import("../src/routes/authRoutes.js");
const { default: reservationRoutes } = await import("../src/routes/reservationRoutes.js");
const { default: resourceRoutes } = await import("../src/routes/resourceRoutes.js");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  app.use(reservationRoutes);
  app.use(resourceRoutes);
  return app;
}

describe("Testes unitários criativos e relevantes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve autenticar usuário mesmo com espaços na matrícula", async () => {
    const app = createApp();

    mockUser.findOne.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      nome: "Vitória",
      matricula: "A123",
      senha: "1234",
      role: "user"
    });

    const response = await request(app)
      .post("/auth/login")
      .send({
        matricula: "   A123   ",
        senha: "1234"
      });

    expect(response.status).toBe(200);
    expect(mockUser.findOne).toHaveBeenCalledWith({ matricula: "A123" });
    expect(response.body.user).toMatchObject({
      nome: "Vitória",
      matricula: "A123",
      role: "user"
    });
  });

  test("deve permitir reserva em horário encostado sem considerar conflito", async () => {
    const app = createApp();

    mockReserva.find.mockResolvedValue([
      {
        horaInicio: "10:00",
        horaFim: "11:00"
      }
    ]);

    mockReserva.create.mockResolvedValue({
      _id: "r1",
      usuario: "u1",
      recurso: "rec1",
      data: "2026-03-27",
      horaInicio: "11:00",
      horaFim: "12:00"
    });

    const response = await request(app)
      .post("/reservations")
      .send({
        usuario: "u1",
        recurso: "rec1",
        data: "2026-03-27",
        horaInicio: "11:00",
        horaFim: "12:00"
      });

    expect(response.status).toBe(201);
    expect(mockReserva.create).toHaveBeenCalledWith({
      usuario: "u1",
      recurso: "rec1",
      data: "2026-03-27",
      horaInicio: "11:00",
      horaFim: "12:00"
    });
    expect(response.body.message).toBe("Reserva criada com sucesso");
  });

  test("deve normalizar horário 9:00 para 09:00 ao criar reserva", async () => {
    const app = createApp();

    mockReserva.find.mockResolvedValue([]);
    mockReserva.create.mockResolvedValue({
      _id: "r2",
      usuario: "u1",
      recurso: "rec1",
      data: "2026-03-27",
      horaInicio: "09:00",
      horaFim: "10:00"
    });

    const response = await request(app)
      .post("/reservations")
      .send({
        usuario: "u1",
        recurso: "rec1",
        data: "2026-03-27",
        horaInicio: "9:00",
        horaFim: "10:00"
      });

    expect(response.status).toBe(201);
    expect(mockReserva.create).toHaveBeenCalledWith({
      usuario: "u1",
      recurso: "rec1",
      data: "2026-03-27",
      horaInicio: "09:00",
      horaFim: "10:00"
    });
  });

  test("deve criar horários padrão de segunda a sexta quando não enviados no cadastro do recurso", async () => {
    const app = createApp();

    mockRecurso.create.mockResolvedValue({
      _id: "rec1",
      nome: "Sala 101",
      descricao: "Sala para aula",
      tipo: "sala",
      horariosDisponiveis: [
        { diaSemana: "segunda", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "terca", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "quarta", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "quinta", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "sexta", horaInicio: "08:00", horaFim: "18:00" }
      ],
      imageUrl: ""
    });

    const response = await request(app)
      .post("/resources")
      .send({
        nome: "Sala 101",
        descricao: "Sala para aula",
        tipo: "sala"
      });

    expect(response.status).toBe(201);
    expect(mockRecurso.create).toHaveBeenCalledWith({
      nome: "Sala 101",
      descricao: "Sala para aula",
      tipo: "sala",
      horariosDisponiveis: [
        { diaSemana: "segunda", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "terca", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "quarta", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "quinta", horaInicio: "08:00", horaFim: "18:00" },
        { diaSemana: "sexta", horaInicio: "08:00", horaFim: "18:00" }
      ],
      imageUrl: ""
    });
  });
});