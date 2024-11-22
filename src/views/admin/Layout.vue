<template>
  <div class="admin-layout">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <router-link class="navbar-brand" to="/admin/dashboard">
          Admin Dashboard
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/dashboard">
                <i class="fas fa-home"></i> Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/books">
                <i class="fas fa-book"></i> Quản lý sách
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/borrows">
                <i class="fas fa-clipboard-list"></i> Quản lý mượn trả
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/users">
                <i class="fas fa-users"></i> Quản lý người dùng
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const isLoggedIn = computed(() => {
  return localStorage.getItem('isAdminLogin') === 'true' && localStorage.getItem('adminToken');
});

function handleLogout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('admin');
  localStorage.removeItem('adminInfo');
  localStorage.removeItem('isAdminLogin');
  router.push('/admin');
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-navbar {
  padding: 1rem;
}

.content {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
}

.nav-link i {
  margin-right: 8px;
}
</style> 
