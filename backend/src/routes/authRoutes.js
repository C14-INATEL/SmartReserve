import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /auth/login — matrícula + senha (usuários criados pela instituição / seed)
router.post("/auth/login", async (req, res) => {
  try {
    const { matricula, senha } = req.body;

    if (!matricula || !senha) {
      return res.status(400).json({ message: "Matrícula e senha são obrigatórias" });
    }

    const matriculaNorm = String(matricula).trim();
    const usuario = await User.findOne({ matricula: matriculaNorm });

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ message: "Matrícula ou senha incorretas" });
    }

    return res.status(200).json({
      user: {
        id: usuario._id.toString(),
        nome: usuario.nome,
        matricula: usuario.matricula,
        role: usuario.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao autenticar",
      error: error.message
    });
  }
});

export default router;
