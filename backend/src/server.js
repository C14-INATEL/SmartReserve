import "dotenv/config";
import express from "express";
import cors from "cors";
import reservationRoutes from "./routes/reservationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import connectDatabase from "./config/database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", reservationRoutes);
app.use("/api", userRoutes);
app.use("/api", resourceRoutes);

app.get("/", (req, res) => {
  res.send("SmartReserve API rodando");
});

await connectDatabase();

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
