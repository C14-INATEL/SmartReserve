import express from "express";
import Recurso from "../models/Recurso.js";
import { horariosSaoValidos } from "../utils/reservationTime.js";

const router = express.Router();

const DIAS_PADRAO = ["segunda", "terca", "quarta", "quinta", "sexta"];

export function montarHorarios(body) {
  if (body.horariosDisponiveis?.length) {
    for (const h of body.horariosDisponiveis) {
      if (!horariosSaoValidos(h.horaInicio, h.horaFim)) {
        throw new Error(`Horário de início (${h.horaInicio}) deve ser menor que o de fim (${h.horaFim}) e formato deve ser HH:mm`);
      }
    }
    return body.horariosDisponiveis;
  }
  const hi = body.horaInicioGlobal || body.horaInicio || "08:00";
  const hf = body.horaFimGlobal || body.horaFim || "18:00";

  if (!horariosSaoValidos(hi, hf)) {
    throw new Error(`Horário de início (${hi}) deve ser menor que o de fim (${hf}) e no formato HH:mm`);
  }

  return DIAS_PADRAO.map((diaSemana) => ({
    diaSemana,
    horaInicio: hi,
    horaFim: hf
  }));
}

// GET /resources - Lista todos os recursos
router.get("/resources", async (req, res) => {
  try {
    const recursos = await Recurso.find();
    return res.status(200).json(recursos);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar recursos",
      error: error.message
    });
  }
});

// POST /resources - Cadastro de recurso (ex.: admin)
router.post("/resources", async (req, res) => {
  try {
    const { nome, descricao, tipo, imageUrl } = req.body;

    if (!nome || !descricao || !tipo) {
      return res.status(400).json({ message: "Nome, descrição e tipo são obrigatórios" });
    }

    const tiposValidos = ["sala", "laboratorio", "equipamento"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ message: "Tipo inválido. Use: sala, laboratorio ou equipamento" });
    }

    let horariosDisponiveis;
    try {
      horariosDisponiveis = montarHorarios(req.body);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const recurso = await Recurso.create({
      nome,
      descricao,
      tipo,
      horariosDisponiveis,
      imageUrl: imageUrl || ""
    });


    return res.status(201).json(recurso);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar recurso",
      error: error.message
    });
  }
});

export default router;
