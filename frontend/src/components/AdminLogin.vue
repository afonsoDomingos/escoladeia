<template>
  <div class="login-wrapper fade-in">
    <div class="login-container">
      <div class="login-header">
        <img :src="config.logoUrl || '/logo.jpg'" alt="Logo" class="login-logo">
        <h1>Painel Administrativo</h1>
        <p class="muted">Gerencie sua escola com eficiência</p>
      </div>

      <div class="card login-card glass">
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="username">Usuário / Email</label>
            <div class="input-with-icon">
              <span class="icon">👤</span>
              <input 
                type="text" 
                id="username" 
                v-model="username" 
                placeholder="Ex: admin@escoladeia.com"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">Senha de Acesso</label>
            <div class="input-with-icon">
              <span class="icon">🔒</span>
              <input 
                type="password" 
                id="password" 
                v-model="password" 
                placeholder="Digite sua senha"
                required
              >
            </div>
          </div>

          <div v-if="error" class="error-msg shake">
            ⚠️ {{ error }}
          </div>

          <button type="submit" class="btn login-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Autenticando...' : 'Entrar no Sistema' }}
          </button>
        </form>
      </div>
      
      <div class="login-footer">
        <p>&copy; 2026 Escola de IA. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const config = ref({ logoUrl: '/logo.jpg', primaryColor: '#FF6600' });
const router = useRouter();
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

// Fetch config to apply branding even on login page
onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/config`);
    if (response.data) {
      config.value = response.data;
      if (config.value.primaryColor) {
        document.documentElement.style.setProperty('--primary-color', config.value.primaryColor);
      }
    }
  } catch (err) {
    console.error('Erro ao carregar branding', err);
  }
});

const login = async () => {
  if (loading.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await axios.post(`${API_URL}/admin/login`, {
      username: username.value,
      password: password.value
    });

    if (response.data.success) {
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin/dashboard');
    }
  } catch (err) {
    if (err.response && err.response.status === 401) {
      error.value = 'Usuário ou senha incorretos.';
    } else {
      error.value = 'Erro ao conectar. Tente novamente.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.5s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  object-fit: cover;
  margin-bottom: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.login-header h1 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1a1a1b;
  margin-bottom: 5px;
}

.muted {
  color: #6c757d;
  font-size: 0.95rem;
}

.glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.login-card {
  padding: 40px;
  border-radius: 24px;
}

.form-group label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon .icon {
  position: absolute;
  left: 15px;
  font-size: 1.1rem;
  pointer-events: none;
  opacity: 0.7;
}

.input-with-icon input {
  padding-left: 45px !important;
  height: 50px;
  border: 2px solid #edeff2;
  transition: all 0.3s ease;
}

.input-with-icon input:focus {
  border-color: var(--primary-color);
  background: #fff;
}

.login-btn {
  height: 54px;
  margin-top: 30px;
  font-size: 1rem;
  letter-spacing: 0.5px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.error-msg {
  background-color: #fff5f5;
  color: #e03131;
  padding: 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-top: 20px;
  border: 1px solid #ffc9c9;
  text-align: center;
}

.login-footer {
  text-align: center;
  margin-top: 40px;
  color: #adb5bd;
  font-size: 0.85rem;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.shake {
  animation: shake 0.3s ease-in-out;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
