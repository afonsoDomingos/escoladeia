<template>
  <div class="container fade-in">
    <div v-if="loadingConfig" class="loading-center">Carregando formulário...</div>
    
    <div v-else>
      <div class="header">
        <div class="title-row">
          <img :src="config.logoUrl || '/logo.jpg'" alt="Logo" class="logo">
          <h1>{{ config.titulo || 'Escola de IA' }}</h1>
        </div>
        <p class="subtitle">{{ config.subtitulo || 'Inscrição no Treinamento' }}</p>
      </div>

      <div class="card form-card">
        <form @submit.prevent="submitForm">
          
          <div class="form-grid">
            <!-- Core Fields -->
            <div class="form-group">
              <label for="nome">{{ config.labels?.nome || 'Nome Completo' }}</label>
              <input type="text" id="nome" v-model="form.nome" required :placeholder="config.labels?.nome || 'Seu nome'">
            </div>

            <div class="form-group">
              <label for="email">{{ config.labels?.email || 'Email' }}</label>
              <input type="email" id="email" v-model="form.email" required placeholder="seu@email.com">
            </div>

            <!-- Dynamic Fields (Extras) -->
            <div v-for="campo in config.camposExtras" :key="campo.key" class="form-group" :class="{'full-width': campo.tipo === 'textarea'}">
              <label>{{ campo.label }}</label>
              
              <input v-if="campo.tipo === 'text'" type="text" v-model="extras[campo.key]" :required="campo.required">
              
              <input v-if="campo.tipo === 'number'" type="number" v-model="extras[campo.key]" :required="campo.required">
              
              <textarea v-if="campo.tipo === 'textarea'" v-model="extras[campo.key]" :required="campo.required" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label for="nivel">{{ config.labels?.nivel || 'Nível' }}</label>
              <select id="nivel" v-model="form.nivel" required>
                <option disabled value="">Selecione...</option>
                <option>Iniciante</option>
                <option>Intermediário</option>
                <option>Avançado</option>
              </select>
            </div>

            <div class="form-group">
              <label for="curso">{{ config.labels?.curso || 'Curso' }}</label>
              <select id="curso" v-model="form.curso" @change="updateValor" required>
                <option disabled value="">Escolha um curso</option>
                <option v-for="curso in config.cursos" :key="curso.nome" :value="curso.nome">
                  {{ curso.nome }}
                </option>
              </select>
            </div>

            <!-- Course Details -->
            <div v-if="selectedCursoDetails" class="course-details full-width">
              <p><strong>Valor:</strong> {{ selectedCursoDetails.valor }} MT | <span class="muted">{{ selectedCursoDetails.desc }}</span></p>
            </div>

            <!-- Payment -->
            <div class="payment-compact full-width">
              <div style="margin-bottom: 5px;"><strong>Pagamento:</strong></div>
               <div class="method-inline">📱 Mpesa: <strong>847877405</strong></div>
               <div class="method-inline">📱 Emola: <strong>879642412</strong></div>
               <div class="method-inline">🏦 BIM: <strong>000100000074301049557</strong></div>
            </div>

          </div> <!-- End Grid -->
          
          <p class="note" style="margin-bottom: 5px; margin-top: 15px;">Anexe o comprovativo abaixo:</p>

          <!-- File Upload -->
          <div class="form-group">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

const form = ref({
  nome: '',
  email: '',
  nivel: '',
  curso: '',
  valor: 0
});

const extras = ref({}); // Store dynamic field values { key: value }
const config = ref({ 
    titulo: '', 
    subtitulo: '', 
    cursos: [], 
    camposExtras: [],
    primaryColor: '#FF6600',
    logoUrl: '/logo.jpg',
    labels: {} 
});
const loadingConfig = ref(true);

const file = ref(null);
const message = ref('');
const messageType = ref('');
const loading = ref(false);
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

// Fetch form configuration on load
onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/config`);
    config.value = response.data;
    
    // Apply Primary Color
    if (config.value.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', config.value.primaryColor);
    }

    // Initialize extras
    if (config.value && config.value.camposExtras) {
        config.value.camposExtras.forEach(campo => {
            extras.value[campo.key] = '';
        });
    }
  } catch (error) {
    console.error('Erro ao carregar configurações', error);
  } finally {
    loadingConfig.value = false;
  }
});

const selectedCursoDetails = computed(() => {
  if (!config.value.cursos) return null;
  return config.value.cursos.find(c => c.nome === form.value.curso);
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
  if (!form.value.nome || !form.value.email || !form.value.nivel || !form.value.curso) {
    message.value = 'Por favor, preencha todos os campos obrigatórios.';
    messageType.value = 'error';
    return;
  }

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
  
  // Serialize dynamic fields
  formData.append('dadosExtras', JSON.stringify(extras.value));

  try {
    const response = await axios.post(`${API_URL}/inscricao`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    message.value = response.data.message;
    messageType.value = 'success';
    
    // Reset form
    form.value = { nome: '', email: '', nivel: '', curso: '', valor: 0 };
    file.value = null;
    document.getElementById('comprovativo').value = '';
    // Reset extras
    Object.keys(extras.value).forEach(key => extras.value[key] = '');
    
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
