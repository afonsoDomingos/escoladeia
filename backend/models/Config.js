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
    }],
    // Visual Customization
    primaryColor: { type: String, default: '#FF6600' },
    logoUrl: { type: String, default: '/logo.jpg' },

    // Behavior
    redirectUrl: { type: String, default: '' },

    // Fixed Fields Customization (Labels)
    labels: {
        nome: { type: String, default: 'Nome Completo' },
        email: { type: String, default: 'Email' },
        nivel: { type: String, default: 'Nível' },
        curso: { type: String, default: 'Curso' }
    }
});

module.exports = mongoose.model('Config', configSchema);
