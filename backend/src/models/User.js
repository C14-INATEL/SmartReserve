import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  matricula: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
}, {
  timestamps: true
});

export default mongoose.model("User", UserSchema);
