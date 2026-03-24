import "dotenv/config";
import express from "express";
import cors from "cors";
import reservationRoutes from "./routes/reservationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import connectDatabase from "./config/database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", reservationRoutes);
app.use("/api", resourceRoutes);

app.get("/", (req, res) => {
  res.send("SmartReserve API rodando");
});

await connectDatabase();

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
