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
  camposExtras: []
});

const loading = ref(true);
const saving = ref(false);
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

const fetchConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/config`);
    // Ensure arrays exist even if empty
    config.value = {
      ...response.data,
      cursos: response.data.cursos || [],
      camposExtras: response.data.camposExtras || []
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

onMounted(fetchConfig);
</script>

<style scoped>
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

.input-dynamic { flex: 2; }
.input-small { width: 100px; }

.btn-small {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-icon-trash {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.item-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #eee;
}

.form-grid-mini {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 0.9rem;
}

.btn-text-danger {
  color: var(--error-color);
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.muted-text { color: #888; font-size: 0.9rem; }
.btn-back { display: inline-block; padding: 10px 20px; text-decoration: none; color: #555; background: #eee; border-radius: 5px; }
</style>
