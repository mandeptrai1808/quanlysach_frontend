<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="text-center mb-4">Đăng ký tài khoản</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Mã độc giả</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.MADOCGIA"
              required
            >
          </div>
          
          <div class="col-md-6 mb-3">
            <label class="form-label">Mật khẩu</label>
            <input 
              type="password" 
              class="form-control" 
              v-model="formData.MATKHAU"
              required
            >
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Họ lót</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.HOLOT"
              required
            >
          </div>
          
          <div class="col-md-6 mb-3">
            <label class="form-label">Tên</label>
            <input 
              type="text" 
              class="form-control" 
              v-model="formData.TEN"
              required
            >
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Ngày sinh</label>
            <input 
              type="date" 
              class="form-control" 
              v-model="formData.NGAYSINH"
              required
            >
          </div>
          
          <div class="col-md-6 mb-3">
            <label class="form-label">Giới tính</label>
            <select 
              class="form-select" 
              v-model="formData.PHAI"
              required
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Địa chỉ</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="formData.DIACHI"
            required
          >
        </div>

        <div class="mb-3">
          <label class="form-label">Số điện thoại</label>
          <input 
            type="tel" 
            class="form-control" 
            v-model="formData.SODIENTHOAI"
            required
          >
        </div>

        <div class="d-grid gap-2">
          <button type="submit" class="btn btn-primary">Đăng ký</button>
          <router-link to="/login" class="btn btn-outline-secondary">
            Đã có tài khoản? Đăng nhập
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
  MADOCGIA: '',
  MATKHAU: '',
  HOLOT: '',
  TEN: '',
  NGAYSINH: '',
  PHAI: 'Nam',
  DIACHI: '',
  SODIENTHOAI: ''
});

async function handleRegister() {
  try {
    const response = await api.registerMember(formData.value);
    
    // Lưu token và thông tin user vào localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    alert('Đăng ký thành công! Quay lại trang đăng nhập.');
    router.push({ name: 'login' });
  } catch (error) {
    alert('Đăng ký thất bại. Vui lòng kiểm tra thông tin đăng ký và thử lại.');
  }
}

function goToLogin() {
  router.push({ name: 'login' });
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  padding: 20px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: red;
  margin-top: 10px;
}

.btn {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn:hover {
  background-color: #0056b3;
}

.mt-3 {
  margin-top: 1rem;
}
</style>
  