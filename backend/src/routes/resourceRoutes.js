import express from "express";
import Recurso from "../models/Recurso.js";

const router = express.Router();

const DIAS_PADRAO = ["segunda", "terca", "quarta", "quinta", "sexta"];

function montarHorarios(body) {
  if (body.horariosDisponiveis?.length) {
    return body.horariosDisponiveis;
  }
  const hi = body.horaInicioGlobal || body.horaInicio || "08:00";
  const hf = body.horaFimGlobal || body.horaFim || "18:00";
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

    const horariosDisponiveis = montarHorarios(req.body);

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
