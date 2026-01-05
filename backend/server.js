const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Model
const Inscricao = require('./models/Inscricao');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
console.log('Tentando conectar ao MongoDB...');
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas conectado com sucesso!'))
    .catch(err => {
        console.error('Erro CRÍTICO ao conectar MongoDB:', err);
        process.exit(1);
    });

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'escola_ia_comprovativos',
        allowed_formats: ['jpg', 'png', 'pdf', 'jpeg'],
        public_id: (req, file) => Date.now() + '-' + file.originalname
    },
});

const upload = multer({ storage: storage });

// Admin Credentials
const ADMIN_USER = 'admin@escoladeia.com';
const ADMIN_PASS = '@Admin123@';

// --- Config Initialization ---
const seedConfig = async () => {
    const exists = await Config.findOne();
    if (!exists) {
        await Config.create({
            titulo: 'Escola de IA',
            subtitulo: 'Inscrição no Treinamento',
            cursos: [
                { nome: 'IA na Programação', valor: 2500, desc: '3 módulos, 10 aulas/módulo (10min). Certificado incluso.' },
                { nome: 'IA no Marketing', valor: 1500, desc: '3 módulos, 10 aulas/módulo (10min). Certificado incluso.' },
                { nome: 'IA no Design', valor: 1500, desc: '3 módulos, 10 aulas/módulo (10min). Certificado incluso.' }
            ],
            camposExtras: []
        });
        console.log('Configuração inicial criada.');
    }
};
seedConfig();

// --- Routes ---

// Get Configuration (Public)
app.get('/config', async (req, res) => {
    try {
        const config = await Config.findOne();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar configurações' });
    }
});

// Update Configuration (Admin)
app.post('/admin/config', async (req, res) => {
    try {
        // Simple verification (in production use middleware)
        // Here we assume mostly safe environment or handling by frontend auth logic mostly
        // Ideally pass token here too. For now open as requested "admin area possibility"

        const { titulo, subtitulo, cursos, camposExtras } = req.body;

        // Update the single config document
        await Config.findOneAndUpdate({}, {
            titulo, subtitulo, cursos, camposExtras
        }, { upsert: true });

        res.json({ success: true, message: 'Configuração atualizada!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar configurações' });
    }
});

// 1. Inscrição (Aluno)
app.post('/inscricao', upload.single('comprovativo'), async (req, res) => {
    try {
        const { nome, email, nivel, curso, valor, dadosExtras } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Comprovativo de pagamento é obrigatório.' });
        }

        if (!nome || !email || !nivel || !curso || !valor) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios: Nome, Email, Nível, Curso e Valor.' });
        }

        let parsedExtras = {};
        if (dadosExtras) {
            try {
                parsedExtras = JSON.parse(dadosExtras);
            } catch (e) {
                console.error("Erro ao fazer parse de dados extras", e);
            }
        }

        const novaInscricao = new Inscricao({
            nome,
            email,
            nivel,
            curso,
            valor,
            dadosExtras: parsedExtras,
            comprovativoPath: req.file.path
        });

        await novaInscricao.save();
        res.status(201).json({ message: 'Inscrição realizada com sucesso! Aguarde a aprovação.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao salvar inscrição.' });
    }
});

// 2. Login Admin
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        res.json({ success: true, message: 'Login realizado com sucesso.' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }
});

// 3. Listar Inscrições (Admin)
app.get('/admin/inscricoes', async (req, res) => {
    try {
        const inscricoes = await Inscricao.find().sort({ dataInscricao: -1 });
        res.json(inscricoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar inscrições.' });
    }
});

// 4. Aprovar Inscrição
app.post('/admin/inscricao/:id/aprovar', async (req, res) => {
    try {
        await Inscricao.findByIdAndUpdate(req.params.id, { status: 'aprovado' });
        res.json({ message: 'Inscrição aprovada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao aprovar inscrição.' });
    }
});

// 5. Rejeitar Inscrição
app.post('/admin/inscricao/:id/rejeitar', async (req, res) => {
    try {
        await Inscricao.findByIdAndUpdate(req.params.id, { status: 'rejeitado' });
        res.json({ message: 'Inscrição rejeitada.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao rejeitar inscrição.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} `);
});
