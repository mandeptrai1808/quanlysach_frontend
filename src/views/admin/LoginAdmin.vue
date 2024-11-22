<template>
  <div class="login-admin-container">
    <div class="login-form">
      <h2 class="text-center mb-4">Đăng nhập Thủ thư</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label">Mã số nhân viên</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-id-card"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.MSNV"
              placeholder="Nhập mã số nhân viên"
              required
            >
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-lock"></i>
            </span>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              class="form-control" 
              v-model="formData.MATKHAU"
              placeholder="Nhập mật khẩu"
              required
            >
            <button 
              class="btn btn-outline-secondary" 
              type="button"
              @click="togglePassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="alert alert-danger" v-if="error">
          {{ error }}
        </div>

        <div class="d-grid gap-2">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
          <router-link to="/" class="btn btn-outline-secondary">
            Quay về trang chủ
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const formData = ref({
  MSNV: '',
  MATKHAU: ''
});
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');

function togglePassword() {
  showPassword.value = !showPassword.value;
}

async function handleLogin() {
  try {
    loading.value = true;
    error.value = '';

    const response = await api.loginLibrarian(formData.value);
    
    if (response && response.accessToken) {
      // Lưu token và thông tin admin
      localStorage.setItem('adminToken', response.accessToken);
      localStorage.setItem('admin', JSON.stringify(response.user));
      localStorage.setItem('isAdminLogin', 'true');

      // Lấy thông tin chi tiết của admin
      try {
        const adminInfo = await api.getLibrarianInfo();
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
      } catch (infoError) {
        console.error('Error fetching admin info:', infoError);
      }

      // Chuyển hướng đến trang admin dashboard
      router.push('/admin/dashboard');
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = 'Mã số nhân viên hoặc mật khẩu không đúng';
    // Xóa dữ liệu admin nếu có lỗi
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('isAdminLogin');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-admin-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #333;
  margin-bottom: 30px;
}

.form-label {
  font-weight: 500;
  color: #555;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.input-group .form-control {
  border-left: none;
}

.input-group .form-control:focus {
  border-color: #dee2e6;
  box-shadow: none;
}

.btn-primary {
  padding: 10px;
  font-weight: 500;
}

.alert {
  margin-bottom: 20px;
  padding: 10px 15px;
}

.btn-outline-secondary {
  text-decoration: none;
  text-align: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-border {
  animation: spin 1s linear infinite;
}
</style> 