<template>
  <div class="container admin-container">
    <div class="admin-header">
      <h1>Editor de Formulário</h1>
      <div class="header-actions">
        <router-link to="/admin/dashboard" class="btn-back">Voltar</router-link>
        <button @click="saveConfig" class="btn-primary" :disabled="saving">
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
               <input v-model="config.primaryColor" type="color" style="width: 50px; height: 40px; padding: 0; border: none; cursor: pointer;">
               <input v-model="config.primaryColor" type="text" placeholder="#FF6600" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
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
        <h3>Ações e Suporte</h3>
        <div class="form-grid-mini">
          <div class="form-group">
            <label>Link de Redirecionamento (WhatsApp/Site)</label>
            <input v-model="config.redirectUrl" type="text" placeholder="https://chat.whatsapp.com/..." class="full-width">
          </div>
          <div class="form-group">
            <label>Número para Informações (Ex: +258...)</label>
            <input v-model="config.contactPhone" type="text" placeholder="+258 84 000 0000" class="full-width">
          </div>
        </div>
        <small class="muted-text">O link aparece no topo e após a inscrição. O número aparece na mensagem de sucesso.</small>
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
      <!-- Floating Bottom Save Button -->
      <div class="actions-footer">
          <button @click="saveConfig" class="btn-primary full-width-mobile" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar Todas as Alterações' }}
          </button>
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
  redirectUrl: '',
  contactPhone: '',
  labels: { nome: 'Nome Completo', email: 'Email', nivel: 'Nível', curso: 'Curso' }
});

const loading = ref(true);
const saving = ref(false);
const uploadingLogo = ref(false);
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

const fetchConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/config`);
    const data = response.data || {};
    
    // Ensure all fields are initialized correctly
    config.value = {
      titulo: data.titulo || 'Escola de IA',
      subtitulo: data.subtitulo || 'Inscrição no Treinamento',
      cursos: data.cursos || [],
      camposExtras: data.camposExtras || [],
      labels: data.labels || { nome: 'Nome Completo', email: 'Email', nivel: 'Nível', curso: 'Curso' },
      logoUrl: data.logoUrl || '/logo.jpg',
      primaryColor: data.primaryColor || '#FF6600',
      redirectUrl: data.redirectUrl || '',
      contactPhone: data.contactPhone || ''
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

    console.log('Enviando para o servidor:', config.value);
    const response = await axios.post(`${API_URL}/admin/config`, config.value);
    
    // Update local state with what's actually in DB
    if (response.data.config) {
        config.value = { ...response.data.config };
    }
    
    alert(response.data.message || 'Configurações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar:', error);
    const msg = error.response?.data?.error || error.message;
    alert('Erro ao salvar: ' + msg);
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
  margin-bottom: 20px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
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
.input-small { width: 120px; } 

/* Improved Button Small (+ Buttons) */
.btn-small {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-small:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-small:active {
  transform: translateY(0);
}

/* Main Container */
.admin-container {
  max-width: 800px; /* Wider than 600px but focused */
  margin: 0 auto;
}

/* Improved Back Button */
.btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 38px; /* Compact height */
  text-decoration: none;
  color: #555;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-back:hover {
  background: #f8f9fa;
  border-color: #ccc;
  color: #333;
}

/* Primary Save Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px; /* Matching height */
  padding: 0 20px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Improved Trash Icon */
.btn-icon-trash {
  background: white;
  border: 1px solid #fee;
  color: #dc3545;
  cursor: pointer;
  font-size: 1rem;
  min-width: 36px;
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
  box-shadow: 0 2px 5px rgba(220, 53, 69, 0.15);
}

.item-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.form-grid-mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f9f9f9;
}

.actions-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

@media (max-width: 600px) {
  .full-width-mobile {
    width: 100%;
  }
}
</style>
```
