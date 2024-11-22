<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <router-link class="navbar-brand" to="/home">
        Thư viện
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Menu chính bên trái -->
        <ul class="navbar-nav me-auto" v-if="user">
          <li class="nav-item">
            <router-link class="nav-link" to="/home">
              <i class="fas fa-home"></i> Trang chủ
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/borrowed-books">
              <i class="fas fa-book-reader"></i> Sách đã mượn
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/about">
              <i class="fas fa-info-circle"></i> Giới thiệu
            </router-link>
          </li>
        </ul>

        <!-- User dropdown bên phải -->
        <div class="navbar-nav ms-auto" v-if="user">
          <div class="nav-item dropdown">
            <button 
              class="nav-link dropdown-toggle btn btn-link" 
              type="button"
              @click="toggleDropdown"
              ref="dropdownButton"
            >
              {{ user.HOLOT + ' ' + user.TEN || 'Độc giả' }}
            </button>
            <div 
              class="dropdown-menu" 
              :class="{ 'show': isDropdownOpen }"
              ref="dropdownMenu"
            >
              <router-link class="dropdown-item" to="/profile">
                <i class="fas fa-user"></i> Hồ sơ
              </router-link>
              <a class="dropdown-item" href="#" @click="logout">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const router = useRouter();
const isDropdownOpen = ref(false);
const dropdownButton = ref(null);
const dropdownMenu = ref(null);

function loadUserFromLocalStorage() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user.value = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (dropdownButton.value && dropdownMenu.value) {
    if (!dropdownButton.value.contains(event.target) && 
        !dropdownMenu.value.contains(event.target)) {
      isDropdownOpen.value = false;
    }
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLogin');
  user.value = null;
  router.push({ name: 'login' });
}

onMounted(() => {
  loadUserFromLocalStorage();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.navbar-nav .nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-nav .nav-link i {
  font-size: 1.1rem;
}

/* Custom styles for dropdown */
.dropdown-toggle {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: inherit;
}

.dropdown-toggle:focus {
  outline: none;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  left: auto;
  margin-top: 0.5rem;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

/* Remove default button styles */
.btn-link {
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: none;
}
</style>

