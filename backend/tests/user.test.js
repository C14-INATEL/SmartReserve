// tests/user.test.js

import mongoose from "mongoose";
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import User from "../src/models/User.js";

describe("Testes unitários do modelo User", () => {

  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/testdb");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1️⃣ Teste: criação válida
  test("deve criar um usuário válido", async () => {
    const user = new User({
      nome: "João",
      matricula: "A123",
      senha: "1234"
    });

    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.nome).toBe("João");
    expect(savedUser.matricula).toBe("A123");
    expect(savedUser.role).toBe("user"); // default
  });

  // 2️⃣ Teste: campo obrigatório (nome)
  test("deve falhar ao criar usuário sem nome", async () => {
    const user = new User({
      matricula: "B123",
      senha: "1234"
    });

    let error;

    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  // 3️⃣ Teste: trim da matrícula (remove espaços em branco)
  test("deve remover espaços da matrícula automaticamente", async () => {
    const user = new User({
      nome: "Maria",
      matricula: "   C123   ",
      senha: "1234"
    });

    const savedUser = await user.save();

    expect(savedUser.matricula).toBe("C123");
  });

  // 4️⃣ Teste: role padrão como user
  test("deve atribuir 'user' como role padrão", async () => {
    const user = new User({
      nome: "Carlos",
      matricula: "D123",
      senha: "1234"
    });

    const savedUser = await user.save();

    expect(savedUser.role).toBe("user");
  });

});
