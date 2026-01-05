<template>
  <div class="container admin-container">
    <div class="admin-header">
      <div class="title-group">
        <h1>Dashboard Admin</h1>
        <p>Gerenciamento de Inscrições</p>
      </div>
      <button @click="logout" class="btn-logout">Sair</button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-container">
      <div class="stat-card">
        <h3>{{ inscricoes.length }}</h3>
        <p>Total Inscritos</p>
      </div>
      <div class="stat-card">
        <h3>{{ inscricoes.filter(i => i.status === 'aprovado').length }}</h3>
        <p>Aprovados</p>
      </div>
      <div class="stat-card">
        <h3>{{ inscricoes.filter(i => i.status === 'pendente').length }}</h3>
        <p>Pendentes</p>
      </div>
      <div class="stat-card" style="border-left-color: #28a745;">
        <h3>{{ totalRevenue }} MT</h3>
        <p>Receita Estimada</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Carregando dados...</div>
    <div v-else-if="inscricoes.length === 0" class="empty">Nenhuma inscrição encontrada.</div>

    <div v-else class="table-responsive">
      <table class="modern-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Aluno & Contato</th>
            <th>Curso & Nível</th>
            <th>Comprovativo</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="insc in inscricoes" :key="insc._id">
            <td>{{ formatDate(insc.dataInscricao) }}</td>
            <td>
              <div style="font-weight: bold;">{{ insc.nome }}</div>
              <div class="muted">{{ insc.email }}</div>
            </td>
            <td>
              <div style="color: var(--primary-color); font-weight: 500;">{{ insc.curso }}</div>
              <div class="muted">{{ insc.nivel }} • {{ insc.valor }} MT</div>
            </td>
            <td>
              <a :href="getFileUrl(insc.comprovativoPath)" target="_blank" class="link-view">
                 📄 Ver Anexo
              </a>
            </td>
            <td>
              <span :class="['status-badge', statusClass(insc.status)]">
                {{ insc.status.toUpperCase() }}
              </span>
            </td>
            <td>
              <div class="actions" v-if="insc.status === 'pendente'">
                <button @click="updateStatus(insc._id, 'aprovar')" class="btn-icon btn-check" title="Aprovar">✓</button>
                <button @click="updateStatus(insc._id, 'rejeitar')" class="btn-icon btn-cross" title="Rejeitar">✕</button>
              </div>
              <span v-else class="action-done">
                {{ insc.status === 'aprovado' ? 'Processado' : 'Rejeitado' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const inscricoes = ref([]);
const loading = ref(true);
const router = useRouter();
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

const totalRevenue = computed(() => {
  return inscricoes.value
    .filter(i => i.status === 'aprovado')
    .reduce((sum, i) => sum + (i.valor || 0), 0)
    .toLocaleString('pt-MZ');
});

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
