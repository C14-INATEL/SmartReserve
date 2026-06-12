/**
 * Regras de horário e sobreposição usadas na criação de reservas.
 * Extraído para permitir testes unitários sem HTTP nem banco.
 */

/** Converte "9:00", "09:00", "14:30" em minutos desde meia-noite */
export function horaParaMinutos(hora) {
  const str = String(hora).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return NaN;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;
  return h * 60 + m;
}

export function minutosParaHora(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Dois intervalos [início, fim) em minutos se sobrepõem */
export function intervalosSobrepoem(aInicio, aFim, bInicio, bFim) {
  return aInicio < bFim && aFim > bInicio;
}

/** Início e fim do dia civil da data informada (comparar reservas no mesmo dia) */
export function inicioEFimDoDia(data) {
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

/** Valida se a string de hora está no padrão HH:mm (24 horas) */
export function validarFormatoHora(hora) {
  if (hora === null || hora === undefined) return false;
  const str = String(hora).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return false;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/** Valida se os horários de início e fim são válidos e se o início é antes do fim */
export function horariosSaoValidos(horaInicio, horaFim) {
  if (!validarFormatoHora(horaInicio) || !validarFormatoHora(horaFim)) {
    return false;
  }
  const inicioMin = horaParaMinutos(horaInicio);
  const fimMin = horaParaMinutos(horaFim);
  return !Number.isNaN(inicioMin) && !Number.isNaN(fimMin) && inicioMin < fimMin;
}

