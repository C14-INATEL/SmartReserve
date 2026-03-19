import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/smartreserve";
    await mongoose.connect(mongoUri);
    console.log("MongoDB conectado com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDatabase;
