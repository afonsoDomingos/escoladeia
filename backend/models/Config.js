const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    titulo: { type: String, default: 'Escola de IA' },
    subtitulo: { type: String, default: 'Inscrição no Treinamento' },
    cursos: [{
        nome: String,
        valor: Number,
        desc: String
    }],
    camposExtras: [{
        key: String, // identificador unico ex: 'telefone'
        label: String,
        tipo: { type: String, enum: ['text', 'number', 'textarea'], default: 'text' },
        required: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('Config', configSchema);
