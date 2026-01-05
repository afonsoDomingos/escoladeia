<template>
  <div class="container admin-container">
    <div class="admin-header">
      <h1>Editor de Formulário</h1>
      <div class="header-actions">
        <router-link to="/admin/dashboard" class="btn-back">Voltar</router-link>
        <button @click="saveConfig" class="btn" :disabled="saving">
          {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Carregando configurações...</div>
    
    <div v-else class="config-form">
      
      <!-- Seção: Informações Gerais -->
      <div class="card config-section">
        <h3>Informações Básicas</h3>
        <div class="form-group">
          <label>Título do Formulário</label>
          <input v-model="config.titulo" type="text" placeholder="Ex: Escola de IA">
        </div>
        <div class="form-group">
          <label>Subtítulo</label>
          <input v-model="config.subtitulo" type="text" placeholder="Ex: Inscrição no Treinamento">
        </div>
      </div>

      <!-- Seção: Aparência -->
      <div class="card config-section">
        <h3>Aparência</h3>
        <div class="form-grid-mini">
           <div class="form-group">
             <label>Cor Principal</label>
             <div style="display: flex; gap: 10px; align-items: center;">
               <input v-model="config.primaryColor" type="color" style="width: 50px; height: 40px; padding: 0;">
               <span>{{ config.primaryColor }}</span>
             </div>
           </div>
           
           <div class="form-group">
             <label>Logo / Foto de Perfil</label>
             <div style="display: flex; gap: 10px; align-items: center;">
                <img :src="config.logoUrl || '/logo.jpg'" class="logo-preview">
                <input type="file" @change="uploadLogo" accept="image/*">
                <span v-if="uploadingLogo" class="muted-text">Enviando...</span>
             </div>
           </div>
        </div>
      </div>

      <!-- Seção: Comportamento -->
      <div class="card config-section">
        <h3>Pós-Inscrição (Redirecionamento)</h3>
        <div class="form-group">
          <label>Link para Grupo/Site (Opcional)</label>
          <input v-model="config.redirectUrl" type="url" placeholder="https://chat.whatsapp.com/..." class="full-width">
          <small class="muted-text">Se preenchido, o aluno verá um botão para acessar este link após se inscrever com sucesso.</small>
        </div>
      </div>

      <!-- Seção: Personalizar Etiquetas -->
      <div class="card config-section">
        <h3>Personalizar Campos Fixos (Etiquetas)</h3>
        <div class="form-grid-mini">
           <div class="form-group">
             <label>Label para 'Nome'</label>
             <input v-model="config.labels.nome">
           </div>
           <div class="form-group">
             <label>Label para 'Email'</label>
             <input v-model="config.labels.email">
           </div>
           <div class="form-group">
             <label>Label para 'Nível'</label>
             <input v-model="config.labels.nivel">
           </div>
           <div class="form-group">
             <label>Label para 'Curso'</label>
             <input v-model="config.labels.curso">
           </div>
        </div>
      </div>

      <!-- Seção: Cursos -->
      <div class="card config-section">
        <div class="section-header">
          <h3>Cursos Disponíveis</h3>
          <button @click="addCurso" class="btn-small">+ Curso</button>
        </div>
        <div v-for="(curso, index) in config.cursos" :key="index" class="item-row">
          <input v-model="curso.nome" placeholder="Nome do Curso" class="input-dynamic">
          <input v-model.number="curso.valor" type="number" placeholder="Valor (MT)" class="input-small">
          <input v-model="curso.desc" placeholder="Descrição curta" class="input-dynamic">
          <button @click="removeCurso(index)" class="btn-icon-trash">🗑️</button>
        </div>
      </div>

      <!-- Seção: Campos Extras -->
      <div class="card config-section">
        <div class="section-header">
          <h3>Campos Extras</h3>
          <p class="muted-text">Adicione novos campos ao formulário de inscrição.</p>
          <button @click="addCampo" class="btn-small">+ Campo</button>
        </div>
        
        <div v-if="config.camposExtras.length === 0" class="empty-state">
          Nenhum campo extra adicionado.
        </div>

        <div v-for="(campo, index) in config.camposExtras" :key="index" class="item-card">
          <div class="form-grid-mini">
            <div class="form-group">
              <label>Nome do Campo (Label)</label>
              <input v-model="campo.label" placeholder="Ex: Telefone, Observação">
            </div>
            <div class="form-group">
               <label>Tipo</label>
               <select v-model="campo.tipo">
                 <option value="text">Texto Curto</option>
                 <option value="number">Número</option>
                 <option value="textarea">Texto Longo</option>
               </select>
            </div>
          </div>
          <div class="actions-row">
             <label class="checkbox-label">
               <input type="checkbox" v-model="campo.required"> Obrigatório
             </label>
             <button @click="removeCampo(index)" class="btn-text-danger">Remover Campo</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const config = ref({
  titulo: '',
  subtitulo: '',
  cursos: [],
  camposExtras: [],
  primaryColor: '#FF6600',
  logoUrl: '/logo.jpg',
  labels: { nome: 'Nome Completo', email: 'Email', nivel: 'Nível', curso: 'Curso' }
});

const loading = ref(true);
const saving = ref(false);
const uploadingLogo = ref(false);
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

const fetchConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/config`);
    // Ensure arrays and objects exist
    config.value = {
      ...response.data,
      cursos: response.data.cursos || [],
      camposExtras: response.data.camposExtras || [],
      labels: response.data.labels || { nome: 'Nome Completo', email: 'Email', nivel: 'Nível', curso: 'Curso' },
      logoUrl: response.data.logoUrl || '/logo.jpg',
      primaryColor: response.data.primaryColor || '#FF6600',
      redirectUrl: response.data.redirectUrl || ''
    };

  } catch (error) {
    console.error('Erro ao carregar config', error);
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  saving.value = true;
  try {
    // Generate unique keys for new fields if missing
    config.value.camposExtras.forEach(c => {
      if (!c.key) c.key = 'field_' + Date.now() + Math.random().toString(36).substr(2, 5);
    });

    await axios.post(`${API_URL}/admin/config`, config.value);
    alert('Configurações salvas com sucesso!');
  } catch (error) {
    alert('Erro ao salvar. Verifique se você está logado.');
  } finally {
    saving.value = false;
  }
};

const addCurso = () => {
  config.value.cursos.push({ nome: '', valor: 0, desc: '' });
};

const removeCurso = (index) => {
  config.value.cursos.splice(index, 1);
};

const addCampo = () => {
  config.value.camposExtras.push({ label: 'Novo Campo', tipo: 'text', required: false, key: '' });
};

const removeCampo = (index) => {
  config.value.camposExtras.splice(index, 1);
};

const uploadLogo = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadingLogo.value = true;
  const formData = new FormData();
  formData.append('logo', file);

  try {
    const response = await axios.post(`${API_URL}/admin/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    config.value.logoUrl = response.data.url;
  } catch (error) {
    alert('Erro ao fazer upload da imagem.');
  } finally {
    uploadingLogo.value = false;
  }
};

onMounted(fetchConfig);
</script>

<style scoped>
.logo-preview {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.config-section {
  margin-bottom: 25px;
  padding: 25px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.item-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

/* Improved Inputs */
.config-section input[type="text"],
.config-section input[type="number"],
.config-section select,
.input-dynamic,
.input-small {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.config-section input:focus,
.config-section select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
}

.input-dynamic { flex: 2; }
.input-small { width: 120px; } /* Slightly wider */

/* Improved Back Button */
.btn-back {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  text-decoration: none;
  color: #555;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f8f9fa;
  border-color: #ccc;
  color: #333;
}

.btn-icon-trash {
  background: white;
  border: 1px solid #fee;
  color: #dc3545;
  cursor: pointer;
  font-size: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon-trash:hover {
  background-color: #fff5f5;
  border-color: #dc3545;
  transform: translateY(-1px);
}
</style>
