<template>
  <div class="login-page">
    <div class="login-container">
      <h2 class="text-center mb-4">Đăng nhập</h2>
      
      <!-- Hiển thị thông báo lỗi nếu có -->
      <div v-if="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="madocgia">Mã độc giả:</label>
          <input
            v-model="madocgia"
            type="text"
            class="form-control"
            id="madocgia"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu:</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            id="password"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary w-100 mt-3">
          Đăng nhập
        </button>

        <!-- <div class="text-center mt-3">
          <router-link to="/register">Chưa có tài khoản? Đăng ký ngay</router-link>
        </div> -->
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const madocgia = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

async function handleLogin() {
  try {
    // Gọi API login với format mới
    const response = await api.login({
      MADOCGIA: madocgia.value,
      MATKHAU: password.value,
    });

    // Lưu token và thông tin user vào localStorage
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('isLogin', 'true');
    localStorage.setItem('user', JSON.stringify(response.user));

    // Điều hướng tới trang chính
    router.push({ name: 'home' });
  } catch (error) {
    console.error('Login failed:', error.message);
    errorMessage.value = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  max-width: 400px;
  width: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}
</style>
  