const mongoose = require('mongoose');

const InscricaoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  nivel: { type: String, required: true }, // Iniciante, Intermediário, Avançado
  curso: { type: String, required: true },
  valor: { type: Number, required: true },
  dadosExtras: { type: mongoose.Schema.Types.Mixed }, // Para campos dinâmicos
  comprovativoPath: { type: String, required: true }, // Caminho do arquivo
  status: { type: String, default: 'pendente', enum: ['pendente', 'aprovado', 'rejeitado'] },
  dataInscricao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inscricao', InscricaoSchema);
