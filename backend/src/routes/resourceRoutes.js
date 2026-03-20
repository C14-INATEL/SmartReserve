import express from "express";
import Recurso from "../models/Recurso.js";

const router = express.Router();

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

export default router;
