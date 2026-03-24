import express from "express";
import Reserva from "../models/Reserva.js";

const router = express.Router();

// GET /reservations?usuario=<ObjectId>
router.get("/reservations", async (req, res) => {
  try {
    const { usuario } = req.query;
    if (!usuario) {
      return res.status(400).json({ message: "Parâmetro usuario é obrigatório" });
    }

    const lista = await Reserva.find({ usuario })
      .populate("recurso")
      .sort({ data: -1, horaInicio: -1 });

    return res.status(200).json(lista);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar reservas",
      error: error.message
    });
  }
});

/** Converte "9:00", "09:00", "14:30" em minutos desde meia-noite */
function horaParaMinutos(hora) {
  const str = String(hora).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return NaN;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return NaN;
  return h * 60 + m;
}

function minutosParaHora(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function intervalosSobrepoem(aInicio, aFim, bInicio, bFim) {
  return aInicio < bFim && aFim > bInicio;
}

/** Início e fim do dia civil da data informada (para comparar reservas no mesmo dia) */
function inicioEFimDoDia(data) {
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

// POST /reservations
router.post("/reservations", async (req, res) => {
  try {
    const { usuario, recurso, data, horaInicio, horaFim } = req.body;

    if (!usuario || !recurso || !data || !horaInicio || !horaFim) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios"
      });
    }

    const inicioMin = horaParaMinutos(horaInicio);
    const fimMin = horaParaMinutos(horaFim);

    if (Number.isNaN(inicioMin) || Number.isNaN(fimMin)) {
      return res.status(400).json({
        message: "Formato de hora inválido. Use HH:mm (ex: 09:00 ou 14:30)"
      });
    }

    if (inicioMin >= fimMin) {
      return res.status(400).json({
        message: "Hora de início deve ser menor que a hora de fim"
      });
    }

    const dia = inicioEFimDoDia(data);
    if (!dia) {
      return res.status(400).json({ message: "Data inválida" });
    }

    const existentes = await Reserva.find({
      recurso,
      data: { $gte: dia.start, $lte: dia.end }
    });

    for (const r of existentes) {
      const eInicio = horaParaMinutos(r.horaInicio);
      const eFim = horaParaMinutos(r.horaFim);
      if (Number.isNaN(eInicio) || Number.isNaN(eFim)) continue;
      if (intervalosSobrepoem(inicioMin, fimMin, eInicio, eFim)) {
        return res.status(400).json({
          message: "Horário já está reservado para esse recurso"
        });
      }
    }

    const horaInicioNorm = minutosParaHora(inicioMin);
    const horaFimNorm = minutosParaHora(fimMin);

    const novaReserva = await Reserva.create({
      usuario,
      recurso,
      data,
      horaInicio: horaInicioNorm,
      horaFim: horaFimNorm
    });

    return res.status(201).json({
      message: "Reserva criada com sucesso",
      reserva: novaReserva
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar reserva",
      error: error.message
    });
  }
});

// DELETE /reservations/:id
router.delete("/reservations/:id", async (req, res) => {
  try {
    const removida = await Reserva.findByIdAndDelete(req.params.id);
    if (!removida) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }
    return res.status(200).json({ message: "Reserva removida" });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover reserva",
      error: error.message
    });
  }
});

export default router;
