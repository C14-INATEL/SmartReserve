import express from "express";
import reservationRoutes from "./routes/reservationRoutes.js";
import connectDatabase from "./config/database.js";

const app = express();

connectDatabase();

app.use(express.json());

app.use("/api", reservationRoutes);

app.get("/", (req, res) => {
  res.send("SmartReserve API rodando");
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
//test 123