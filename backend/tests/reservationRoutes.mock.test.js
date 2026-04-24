import request from "supertest"; // simula requisições HTTP
import express from "express"; // servidor fake para teste
import { jest, describe, test, expect, beforeEach } from "@jest/globals"; // framework de testes

// mock do banco de dados
const mockReserva = {
  find: jest.fn(),
  create: jest.fn()
};

jest.unstable_mockModule("../src/models/Reserva.js", () => ({
  default: mockReserva
}));

// importa depois do mock
const { default: reservationRoutes } = await import("../src/routes/reservationRoutes.js");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(reservationRoutes);
  return app;
}

describe("Mock routes - reservas", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Teste 1 - Erro no banco de dados -> Retorna 500
  test("deve retornar erro 500 quando o banco falhar", async () => {
    const app = createApp();

    mockReserva.find.mockResolvedValue([]);
    mockReserva.create.mockRejectedValue(new Error("Erro no banco"));

    const response = await request(app)
      .post("/reservations")
      .send({
        usuario: "u1",
        recurso: "rec1",
        data: "2026-03-27",
        horaInicio: "10:00",
        horaFim: "11:00"
      });

    expect(response.status).toBe(500);
  });

  // Teste 2 - Sucesso no banco -> Chama a função create
  test("deve chamar o create corretamente ao criar reserva", async () => {
    const app = createApp();

    mockReserva.find.mockResolvedValue([]);

    mockReserva.create.mockResolvedValue({
      usuario: "u1",
      recurso: "rec1"
    });

    await request(app)
      .post("/reservations")
      .send({
        usuario: "u1",
        recurso: "rec1",
        data: "2026-03-27",
        horaInicio: "10:00",
        horaFim: "11:00"
      });

    expect(mockReserva.create).toHaveBeenCalled();
  });

});
