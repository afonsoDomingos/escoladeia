const mongoose = require('mongoose');

const InscricaoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  nivel: { type: String, required: true }, // Iniciante, Intermediário, Avançado
  curso: { type: String, required: true },
  valor: { type: Number, required: true },
  comprovativoPath: { type: String, required: true }, // Caminho do arquivo
  status: { type: String, default: 'pendente', enum: ['pendente', 'aprovado', 'rejeitado'] },
  dataInscricao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inscricao', InscricaoSchema);
