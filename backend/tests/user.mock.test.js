import { jest } from "@jest/globals";

// função mockada
const mockSave = jest.fn();

// ✅ mock ESM correto
jest.unstable_mockModule("../src/models/User.js", () => ({
  default: class {
    constructor(data) {
      Object.assign(this, data);
    }

    save = mockSave;
  }
}));

// ⚠️ IMPORTANTE: import depois do mock
const { default: User } = await import("../src/models/User.js");

describe("Mock User (ESM)", () => {

  it("deve simular criação de usuário", async () => {
    mockSave.mockResolvedValue({
      _id: "1",
      nome: "Vitória",
      matricula: "X123",
      role: "user"
    });

    const user = new User({
      nome: "Vitória",
      matricula: "X123",
      senha: "1234"
    });

    const result = await user.save();

    expect(result.nome).toBe("Vitória");
    expect(mockSave).toHaveBeenCalled();
  });

  it("deve simular erro ao salvar", async () => {
    mockSave.mockRejectedValue(new Error("Erro"));

    const user = new User({
      nome: "Erro",
      matricula: "E123",
      senha: "1234"
    });

    await expect(user.save()).rejects.toThrow("Erro");
  });

});