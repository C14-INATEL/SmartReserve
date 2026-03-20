import mongoose from "mongoose";

const ReservaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recurso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Feature",
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  horaInicio: {
    type: String,
    required: true
  },
  horaFim: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model("Reserva", ReservaSchema);
