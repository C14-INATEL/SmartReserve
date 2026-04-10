import express from "express";
import Reserva from "../models/Reserva.js";
import {
  horaParaMinutos,
  minutosParaHora,
  intervalosSobrepoem,
  inicioEFimDoDia
} from "../utils/reservationTime.js";

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
