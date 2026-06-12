const request = require("supertest");
const createApp = require("../../src/app");

// Mock do model Reservation
jest.mock("../../src/models/Reservation");

const Reservation = require("../../src/models/Reservation");

describe("Reservations - Delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve deletar uma reserva com sucesso", async () => {
    const app = createApp();

    Reservation.findByIdAndDelete.mockResolvedValue({
      _id: "r1"
    });

    const response = await request(app)
      .delete("/reservations/r1");

    expect(Reservation.findByIdAndDelete).toHaveBeenCalledWith("r1");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message.toLowerCase()).toMatch(/sucesso|removida|deletada/);
  });

  test("deve retornar 404 ao tentar deletar reserva inexistente", async () => {
    const app = createApp();

    Reservation.findByIdAndDelete.mockResolvedValue(null);

    const response = await request(app)
      .delete("/reservations/nao_existe");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});
