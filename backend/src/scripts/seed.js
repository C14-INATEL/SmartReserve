import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Recurso from "../models/Recurso.js";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/smartreserve";

const dias = ["segunda", "terca", "quarta", "quinta", "sexta"];
const slot = (hi, hf) => dias.map((diaSemana) => ({ diaSemana, horaInicio: hi, horaFim: hf }));

async function main() {
  await mongoose.connect(uri);
  console.log("MongoDB conectado.");

  await User.findOneAndUpdate(
    { matricula: "180" },
    {
      nome: "Álvaro Belarmino",
      matricula: "180",
      senha: "123456",
      role: "admin"
    },
    { upsert: true, returnDocument: "after" }
  );
  console.log("Usuário teste: matrícula 180 | senha 123456 (perfil admin).");

  const n = await Recurso.countDocuments();
  if (n === 0) {
    await Recurso.insertMany([
      {
        nome: "Sala de Reunião Alpha",
        descricao: "Sala com projetor e espaço para 10 pessoas.",
        tipo: "sala",
        horariosDisponiveis: slot("08:00", "20:00"),
        imageUrl: "https://picsum.photos/seed/sala-alpha/800/600"
      },
      {
        nome: "Laboratório de Informática 01",
        descricao: "Computadores e software de engenharia.",
        tipo: "laboratorio",
        horariosDisponiveis: slot("07:00", "22:00"),
        imageUrl: "https://picsum.photos/seed/lab01/800/600"
      },
      {
        nome: "Projetor 4K",
        descricao: "Equipamento portátil para apresentações.",
        tipo: "equipamento",
        horariosDisponiveis: slot("08:00", "18:00"),
        imageUrl: "https://picsum.photos/seed/projetor/800/600"
      }
    ]);
    console.log("Recursos de exemplo criados.");
  } else {
    console.log(`Já existem ${n} recurso(s) no banco — recursos não alterados.`);
  }

  await mongoose.disconnect();
  console.log("Seed finalizado.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
