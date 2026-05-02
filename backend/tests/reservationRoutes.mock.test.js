import request from "supertest"; // simula requisições HTTP
import express from "express"; // servidor fake para teste
import { jest, describe, test, expect, beforeEach } from "@jest/globals"; // framework de testes

// mock do banco de dados
const mockReserva = {
  find: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

jest.unstable_mockModule("../src/models/Reserva.js", () => ({
  default: mockReserva,
}));

// importa depois do mock
const { default: reservationRoutes } =
  await import("../src/routes/reservationRoutes.js");

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

    const response = await request(app).post("/reservations").send({
      usuario: "u1",
      recurso: "rec1",
      data: "2026-03-27",
      horaInicio: "10:00",
      horaFim: "11:00",
    });

    expect(response.status).toBe(500);
  });

  // Teste 2 - Sucesso no banco -> Chama a função create
  test("deve chamar o create corretamente ao criar reserva", async () => {
    const app = createApp();

    mockReserva.find.mockResolvedValue([]);

    mockReserva.create.mockResolvedValue({
      usuario: "u1",
      recurso: "rec1",
    });

    await request(app).post("/reservations").send({
      usuario: "u1",
      recurso: "rec1",
      data: "2026-03-27",
      horaInicio: "10:00",
      horaFim: "11:00",
    });

    expect(mockReserva.create).toHaveBeenCalled();
  });

<<<<<<< HEAD
  //Teste de Conflito de Horário
  test("deve retornar 400 se o horário solicitado já estiver ocupado", async () => {
    const app = createApp();

    // Mock: simula uma reserva já existente no banco para o mesmo recurso/data
    mockReserva.find.mockResolvedValue([{
      horaInicio: "10:00",
      horaFim: "11:00"
    }]);

    const response = await request(app)
      .post("/reservations")
      .send({
        usuario: "660c6d2a8b9e5a001a123456",
        recurso: "660c6d2a8b9e5a001a654321",
        data: "2026-04-27",
        horaInicio: "10:30",
        horaFim: "11:30"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Horário já está reservado para esse recurso");
  });

  //Teste de Campos Obrigatórios (Bad Request)
  test("deve retornar 400 se algum campo obrigatório estiver faltando", async () => {
    const app = createApp();

    // Enviando apenas o usuário (campos como data, recurso, etc. faltam)
    const response = await request(app)
      .post("/reservations")
      .send({
        usuario: "660c6d2a8b9e5a001a123456"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Todos os campos são obrigatórios");
  });
});
=======
  // Teste 3 - GET com usuario -> Retorna lista mockada
  test("deve retornar lista de reservas para um usuario", async () => {
    const app = createApp();

    const reservasFake = [
      { usuario: "u1", recurso: { nome: "Sala A" }, data: "2026-03-27", horaInicio: "10:00", horaFim: "11:00" }
    ];

    // find() retorna um objeto encadeável (Query do Mongoose retorna .populate().sort())
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(reservasFake)
    };
    mockReserva.find.mockReturnValue(mockQuery);

    const response = await request(app).get("/reservations?usuario=u1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(mockReserva.find).toHaveBeenCalledWith({ usuario: "u1" });
    expect(mockQuery.populate).toHaveBeenCalledWith("recurso");
  });

  // Teste 4 - DELETE reserva não encontrada -> Retorna 404
  test("deve retornar 404 ao deletar reserva inexistente", async () => {
    const app = createApp();

    mockReserva.findByIdAndDelete.mockResolvedValue(null);

    const response = await request(app).delete("/reservations/id-inexistente");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Reserva não encontrada");
  });
});
>>>>>>> b453615 (Feat:criação de dois mocks)
