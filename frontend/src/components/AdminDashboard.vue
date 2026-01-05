<template>
  <div class="container admin-container">
    <div class="admin-header">
      <div class="title-group">
        <h1>Dashboard Admin</h1>
        <p>Gerenciamento de Inscrições</p>
      </div>
      
      <!-- User Profile Dropdown -->
      <div class="user-menu" ref="menuRef">
        <button @click="showMenu = !showMenu" class="avatar-btn">
          <div class="avatar-circle">A</div>
        </button>

        <transition name="fade">
          <div v-if="showMenu" class="dropdown-menu">
            <div class="menu-header">
              <strong>Admin</strong>
              <small>admin@escoladeia.com</small>
            </div>
            <ul>
              <li>
                <router-link to="/admin/config" class="menu-item" @click="showMenu = false">
                  ⚙️ Configurações do Site
                </router-link>
              </li>
              <li>
                <button @click="logout" class="menu-item text-danger">
                  ↪️ Sair
                </button>
              </li>
            </ul>
          </div>
        </transition>
      </div>

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
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const inscricoes = ref([]);
const loading = ref(true);
const router = useRouter();
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

// Dropdown State
const showMenu = ref(false);
const menuRef = ref(null);

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

const closeMenu = (e) => {
    if (menuRef.value && !menuRef.value.contains(e.target)) {
        showMenu.value = false;
    }
}

onMounted(() => {
    fetchInscricoes();
    document.addEventListener('click', closeMenu);
});

onUnmounted(() => {
    document.removeEventListener('click', closeMenu);
});
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

/* User Menu Dropdown Styles */
.user-menu {
  position: relative;
}

.avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #0f172a; /* Dark Blue like image */
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 1px solid #eee;
  z-index: 100;
  overflow: hidden;
}

.menu-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.menu-header strong {
  display: block;
  color: #333;
}

.menu-header small {
  color: #666;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 12px 15px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  color: #333;
  text-decoration: none;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.menu-item:hover {
  background-color: #f1f3f5;
}

.text-danger { color: #dc3545; }

/* Fade Transition for Dropdown */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
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

.actions { display: flex; gap: 10px; }
.action-done { font-size: 0.9em; color: var(--text-light); }
</style>
