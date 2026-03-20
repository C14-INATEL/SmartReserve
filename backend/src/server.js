import "dotenv/config";
import express from "express";
import cors from "cors";
import reservationRoutes from "./routes/reservationRoutes.js";
import connectDatabase from "./config/database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", reservationRoutes);

app.get("/", (req, res) => {
  res.send("SmartReserve API running");
});

await connectDatabase();

app.listen(3000, () => {
  console.log("Server running on port: 3000");
});
