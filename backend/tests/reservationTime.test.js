/**
 * Testes unitários — regras de horário e sobreposição (Álvaro / entrega individual).
 * Cobrem parsing de hora, limites do dia e detecção de conflito entre intervalos.
 */
import { describe, test, expect } from "@jest/globals";
import {
  horaParaMinutos,
  minutosParaHora,
  intervalosSobrepoem,
  inicioEFimDoDia
} from "../src/utils/reservationTime.js";

describe("reservationTime — regras de negócio de reserva", () => {
  test("parseia 9:00 e 09:00 para o mesmo valor em minutos (evita erro de string)", () => {
    expect(horaParaMinutos("9:00")).toBe(9 * 60);
    expect(horaParaMinutos("09:00")).toBe(9 * 60);
    expect(horaParaMinutos(" 14:30 ")).toBe(14 * 60 + 30);
  });

  test("rejeita formato de hora inválido ou fora do relógio (NaN)", () => {
    expect(horaParaMinutos("99:99")).toBeNaN();
    expect(horaParaMinutos("25:00")).toBeNaN();
    expect(horaParaMinutos("10-00")).toBeNaN();
  });

  test("intervalos encostados (10–11 e 11–12) não se sobrepõem; parcialmente sobrepostos sim", () => {
    const a = horaParaMinutos("10:00");
    const b = horaParaMinutos("11:00");
    const c = horaParaMinutos("11:00");
    const d = horaParaMinutos("12:00");
    expect(intervalosSobrepoem(a, b, c, d)).toBe(false);

    const x1 = horaParaMinutos("10:00");
    const x2 = horaParaMinutos("11:00");
    const y1 = horaParaMinutos("10:30");
    const y2 = horaParaMinutos("11:30");
    expect(intervalosSobrepoem(x1, x2, y1, y2)).toBe(true);
  });

  test("inicioEFimDoDia cobre o mesmo dia civil e minutosParaHora é reversível", () => {
    const diaLocal = new Date(2026, 5, 15, 14, 30, 0);
    const { start, end } = inicioEFimDoDia(diaLocal);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(5);
    expect(start.getDate()).toBe(15);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);

    const m = horaParaMinutos("16:45");
    expect(minutosParaHora(m)).toBe("16:45");
    expect(horaParaMinutos(minutosParaHora(m))).toBe(m);
  });
});
