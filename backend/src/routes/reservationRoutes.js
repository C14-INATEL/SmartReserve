import express from "express";
import Reserva from "../models/Reserva.js";

const router = express.Router();

// POST /reservations
router.post("/reservations", async (req, res) => {
  try {
    const { usuario, recurso, data, horaInicio, horaFim } = req.body;

    // validação de campos
    if (!usuario || !recurso || !data || !horaInicio || !horaFim) {
      return res.status(400).json({
        message: "Todos os campos são obrigatórios"
      });
    }

    // validação de horário
    if (horaInicio >= horaFim) {
      return res.status(400).json({
        message: "Hora de início deve ser menor que a hora de fim"
      });
    }

    // verificação de conflito
    const conflito = await Reserva.findOne({
      recurso,
      data,
      horaInicio: { $lt: horaFim },
      horaFim: { $gt: horaInicio }
    });

    if (conflito) {
      return res.status(400).json({
        message: "Horário já está reservado para esse recurso"
      });
    }

    // criação da reserva
    const novaReserva = await Reserva.create({
      usuario,
      recurso,
      data,
      horaInicio,
      horaFim
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

export default router;