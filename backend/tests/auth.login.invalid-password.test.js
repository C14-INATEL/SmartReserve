const request = require("supertest");
const createApp = require("../../src/app");

// Mock do model User
jest.mock("../../src/models/User");

const User = require("../../src/models/User");

describe("Auth - Login com senha inválida", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("deve retornar erro ao tentar logar com senha incorreta", async () => {
    const app = createApp();

    // Mock do usuário existente
    User.findOne.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      nome: "João",
      matricula: "A123",
      senha: "1234", // senha correta no banco
      role: "user"
    });

    const response = await request(app)
      .post("/auth/login")
      .send({
        matricula: "A123",
        senha: "senha_errada" // senha incorreta
      });

    expect(User.findOne).toHaveBeenCalledWith({ matricula: "A123" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message.toLowerCase()).toMatch(/senha|credenciais|inválid/);
  });
});
