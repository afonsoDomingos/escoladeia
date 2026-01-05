<template>
  <div class="container fade-in">
    <div class="header">
      <div class="title-row">
        <img src="/logo.jpg" alt="Logo" class="logo">
        <h1>Escola de IA</h1>
      </div>
      <p class="subtitle">Inscrição no Treinamento</p>
    </div>

    <div class="card form-card">
      <form @submit.prevent="submitForm">
        
        <!-- Personal Info -->
        <div class="form-group">
          <label for="nome">Nome Completo</label>
          <input type="text" id="nome" v-model="form.nome" required placeholder="Seu nome completo">
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" required placeholder="seu@email.com">
        </div>

        <div class="form-group">
          <label for="nivel">Nível do Aluno</label>
          <select id="nivel" v-model="form.nivel" required>
            <option disabled value="">Selecione...</option>
            <option>Iniciante</option>
            <option>Intermediário</option>
            <option>Avançado</option>
          </select>
        </div>

        <!-- Course Selection -->
        <div class="form-group">
          <label for="curso">Selecione o Curso</label>
          <select id="curso" v-model="form.curso" @change="updateValor" required>
            <option disabled value="">Escolha um curso</option>
            <option v-for="curso in cursos" :key="curso.nome" :value="curso.nome">
              {{ curso.nome }}
            </option>
          </select>
        </div>

        <!-- Course Details Display -->
        <div v-if="selectedCursoDetails" class="course-details">
          <p><strong>Valor:</strong> {{ selectedCursoDetails.valor }} MT</p>
          <p class="muted">{{ selectedCursoDetails.desc }}</p>
        </div>

        <!-- Payment Instructions -->
        <div class="payment-info">
          <h3>Instruções de Pagamento</h3>
          <div class="methods">
            <div class="method">
              <strong>Mpesa:</strong> 847877405 (Afonso Domingos)
            </div>
            <div class="method">
              <strong>Emola:</strong> 879642412 (Afonso Domingos)
            </div>
            <div class="method">
              <strong>BIM NIB:</strong> 000100000074301049557
            </div>
            <div class="method">
              <strong>Paypal:</strong> karinganastudio23@gmail.com
            </div>
          </div>
          <p class="note">Realize o pagamento e anexe o comprovativo abaixo.</p>
        </div>

        <!-- File Upload -->
        <div class="form-group">
          <label for="comprovativo">Comprovativo de Pagamento (PDF ou Imagem)</label>
          <input type="file" id="comprovativo" ref="fileInput" @change="handleFileUpload" required accept="image/*,.pdf">
        </div>

        <!-- Feedback Messages -->
        <div v-if="message" :class="['feedback', messageType]">
          {{ message }}
        </div>

        <button type="submit" class="btn" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Confirmar Inscrição' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

const form = ref({
  nome: '',
  email: '',
  nivel: '',
  curso: '',
  valor: 0
});

const file = ref(null);
const message = ref('');
const messageType = ref(''); // 'success' or 'error'
const messageType = ref(''); // 'success' or 'error'
const loading = ref(false);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const cursos = [
  { nome: 'IA na Programação', valor: 2500, desc: '3 módulos, 10 aulas/módulo (10min). Certificado incluso.' },
  { nome: 'IA no Marketing', valor: 1500, desc: '3 módulos, 10 aulas/módulo (10min). Certificado incluso.' },
  { nome: 'IA no Design', valor: 1500, desc: '3 módulos, 10 aulas/módulo (10min). Certificado incluso.' }
];

const selectedCursoDetails = computed(() => {
  return cursos.find(c => c.nome === form.value.curso);
});

const updateValor = () => {
  if (selectedCursoDetails.value) {
    form.value.valor = selectedCursoDetails.value.valor;
  }
};

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
};

const submitForm = async () => {
  // 1. Validar Campos de Texto
  if (!form.value.nome || !form.value.email || !form.value.nivel || !form.value.curso) {
    message.value = 'Por favor, preencha todos os campos obrigatórios.';
    messageType.value = 'error';
    return;
  }

  // 2. Validar Comprovativo (Obrigatório)
  if (!file.value) {
    message.value = 'O envio do comprovativo de pagamento é OBRIGATÓRIO.';
    messageType.value = 'error';
    return;
  }

  loading.value = true;
  message.value = '';

  const formData = new FormData();
  formData.append('nome', form.value.nome);
  formData.append('email', form.value.email);
  formData.append('nivel', form.value.nivel);
  formData.append('curso', form.value.curso);
  formData.append('valor', form.value.valor);
  formData.append('comprovativo', file.value);

  try {
    const response = await axios.post(`${API_URL}/inscricao`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    message.value = response.data.message;
    messageType.value = 'success';
    // Reset form
    form.value = { nome: '', email: '', nivel: '', curso: '', valor: 0 };
    file.value = null;
    document.getElementById('comprovativo').value = ''; // Reset input
  } catch (error) {
    console.error(error);
    message.value = error.response?.data?.error || 'Erro ao enviar inscrição.';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
  font-weight: 800;
  margin: 0; /* Remove default margin for better alignment */
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.logo {
  width: 60px; /* Adjust size as needed */
  height: 60px;
  border-radius: 50%; /* Circular for a profile picture feel */
  object-fit: cover;
  border: 3px solid var(--primary-color);
}

.subtitle {
  color: var(--text-light);
  font-size: 1.2rem;
}

.form-card {
  border-top: 5px solid var(--primary-color);
}

.course-details {
  background-color: #FFF3E0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid var(--primary-color);
}

.payment-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.methods {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.method {
  font-size: 0.95rem;
}

.note {
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--text-light);
  font-style: italic;
}

.feedback {
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: bold;
}

.feedback.success {
  background-color: #d4edda;
  color: #155724;
}

.feedback.error {
  background-color: #f8d7da;
  color: #721c24;
}

.fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
