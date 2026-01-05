<template>
  <div class="container fade-in">
    <div class="header">
      <h1>Área Admin</h1>
      <p class="subtitle">Faça login para gerenciar inscrições</p>
    </div>

    <div class="card login-card">
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Usuário</label>
          <input type="text" id="username" v-model="username" required>
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" required>
        </div>

        <div v-if="error" class="error-msg">
          {{ error }}
        </div>

        <button type="submit" class="btn">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').trim();

const login = async () => {
  try {
    const response = await axios.post(`${API_URL}/admin/login`, {
      username: username.value,
      password: password.value
    });

    if (response.data.success) {
      localStorage.setItem('adminAuth', 'true');
      router.push('/admin/dashboard');
    } else {
      error.value = 'Credenciais inválidas';
    }
  } catch (err) {
    error.value = 'Erro ao conectar com servidor';
  }
};
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 0 auto;
}
.header { text-align: center; margin-bottom: 20px; }
.error-msg { color: var(--error-color); margin-top: 10px; text-align: center; }
</style>
