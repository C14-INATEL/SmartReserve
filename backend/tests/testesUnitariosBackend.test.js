// tests/unitarios.test.js
import { describe, test, expect } from "@jest/globals";
import { montarHorarios } from "../src/routes/resourceRoutes.js";
import { minutosParaHora, inicioEFimDoDia } from "../src/utils/reservationTime.js";

describe("4 Testes Unitários Relevantes", () => {

  // 1️⃣ Unidade: Lógica de montagem de horários padrão
  test("deve montar horários padrão (08:00 - 18:00) quando o corpo da requisição for vazio", () => {
    const resultado = montarHorarios({});
    expect(resultado).toHaveLength(5); // Segunda a Sexta
    expect(resultado[0].horaInicio).toBe("08:00");
    expect(resultado[0].horaFim).toBe("18:00");
  });

  // 2️⃣ Unidade: Lógica de horários customizados globais
  test("deve usar o horário global (07:00 - 22:00) para todos os dias se fornecido", () => {
    const body = { horaInicioGlobal: "07:00", horaFimGlobal: "22:00" };
    const resultado = montarHorarios(body);
    expect(resultado[0].horaInicio).toBe("07:00");
    expect(resultado[4].horaFim).toBe("22:00");
  });

  // 3️⃣ Unidade: Conversão de minutos para string de hora (Limite do dia)
  test("deve converter 1439 minutos para a string '23:59' (último minuto do dia)", () => {
    const resultado = minutosParaHora(1439);
    expect(resultado).toBe("23:59");
  });

  // 4️⃣ Unidade: Tratamento de data inválida
  test("deve retornar null ao tentar calcular o início/fim de uma data inválida", () => {
    const resultado = inicioEFimDoDia("data-completamente-errada");
    expect(resultado).toBeNull();
  });

});
