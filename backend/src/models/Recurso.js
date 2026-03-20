import mongoose from "mongoose";

const RecursoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    required: true,
    enum: ["room", "laboratory", "equipment"]
  },
  horariosDisponiveis: [{
    diaSemana: {
      type: String,
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
  }]
}, {
  timestamps: true
});

export default mongoose.model("Recurso", RecursoSchema);
