<template>
  <div class="container admin-container">
    <div class="admin-header">
      <div class="title-group">
        <h1>Dashboard</h1>
        <p>Inscrições Recentes</p>
      </div>
      <button @click="logout" class="btn-logout">Sair</button>
    </div>

    <div v-if="loading" class="loading">Carregando...</div>
    <div v-else-if="inscricoes.length === 0" class="empty">Nenhuma inscrição encontrada.</div>

    <div v-else class="table-responsive card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Aluno</th>
            <th>Curso</th>
            <th>Status</th>
            <th>Comprovativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="insc in inscricoes" :key="insc._id">
            <td>{{ formatDate(insc.dataInscricao) }}</td>
            <td>
              <strong>{{ insc.nome }}</strong><br>
              <span class="muted">{{ insc.email }}</span><br>
              <small>{{ insc.nivel }}</small>
            </td>
            <td>{{ insc.curso }}<br><small>{{ insc.valor }} MT</small></td>
            <td>
              <span :class="statusClass(insc.status)">{{ insc.status.toUpperCase() }}</span>
            </td>
            <td>
              <a :href="getFileUrl(insc.comprovativoPath)" target="_blank" class="link-view">
                Ver Arquivo
              </a>
            </td>
            <td>
              <div class="actions" v-if="insc.status === 'pendente'">
                <button @click="updateStatus(insc._id, 'aprovar')" class="btn-action btn-approve">✓</button>
                <button @click="updateStatus(insc._id, 'rejeitar')" class="btn-action btn-reject">✗</button>
              </div>
              <span v-else class="action-done">
                {{ insc.status === 'aprovado' ? 'Aprovado' : 'Rejeitado' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const inscricoes = ref([]);
const loading = ref(true);
const router = useRouter();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fetchInscricoes = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/inscricoes`);
    inscricoes.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar dados', error);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (id, action) => {
  try {
    await axios.post(`${API_URL}/admin/inscricao/${id}/${action}`);
    // Refresh list or update local
    const index = inscricoes.value.findIndex(i => i._id === id);
    if (index !== -1) {
      inscricoes.value[index].status = action === 'aprovar' ? 'aprovado' : 'rejeitado';
    }
  } catch (error) {
    alert('Erro ao atualizar status');
  }
};

const getFileUrl = (path) => {
  return path;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const statusClass = (status) => {
  return `status-${status}`;
};

const logout = () => {
  localStorage.removeItem('adminAuth');
  router.push('/admin');
};

onMounted(fetchInscricoes);
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-group h1 { margin: 0; }

.btn-logout {
  background: var(--text-light);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.table-responsive {
  overflow-x: auto;
}

.muted { color: #888; font-size: 0.9em; }

.link-view {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: bold;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-action {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.btn-approve { background-color: var(--success-color); }
.btn-reject { background-color: var(--error-color); }

.action-done { font-size: 0.9em; color: var(--text-light); }
</style>
