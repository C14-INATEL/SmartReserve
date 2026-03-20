import express from "express";
import User from "../models/User.js";

const router = express.Router();

// POST /users - Cria um novo usuário
router.post("/users", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios" });
    }

    // Verificar se o e-mail já existe no banco
    const emailExiste = await User.findOne({ email });
    if (emailExiste) {
      return res.status(400).json({ message: "O e-mail informado já está em uso." });
    }

    // Criação do usuário (Atenção: A senha será guardada em texto puro nesta etapa)
    const novoUsuario = await User.create({
      nome,
      email,
      senha
    });

    // Retorna mensagem de sucesso ocultando a senha da resposta json
    return res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      user: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erro ao cadastrar usuário",
      error: error.message
    });
  }
});

export default router;
