<template>
  <div class="profile-page">
    <div class="profile-header">
      <!-- Avatar -->
      <img :src="defaultAvatar" alt="User Avatar" class="avatar" />

      <!-- User Information -->
      <div class="user-info">
        <h2>{{ user.HOLOT }} {{ user.TEN }}</h2>
        <p><i class="fas fa-id-card"></i> MSSV: {{ user.MSSV }}</p>
        <p><i class="fas fa-venus-mars"></i> Giới tính: {{ user.PHAI }}</p>
        <p><i class="fas fa-birthday-cake"></i> Ngày sinh: {{ formatDate(user.NGAYSINH) }}</p>
        <p><i class="fas fa-phone"></i> SĐT: {{ user.SODIENTHOAI }}</p>
        <p><i class="fas fa-envelope"></i> Email: {{ user.EMAIL }}</p>
        <p><i class="fas fa-map-marker-alt"></i> Địa chỉ: {{ user.DIACHI }}</p>
      </div>
    </div>

    <!-- Thống kê sách mượn -->
    <div class="book-stats">
      <h3>Thống Kê Mượn Sách</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <i class="fas fa-book"></i>
          <p>Tổng số sách đã mượn</p>
          <strong>{{ bookStats.total }}</strong>
        </div>
        <div class="stat-item">
          <i class="fas fa-clock"></i>
          <p>Đang chờ xác nhận</p>
          <strong>{{ bookStats.pending }}</strong>
        </div>
        <div class="stat-item">
          <i class="fas fa-book-reader"></i>
          <p>Đang mợn</p>
          <strong>{{ bookStats.borrowing }}</strong>
        </div>
        <div class="stat-item">
          <i class="fas fa-check-circle"></i>
          <p>Đã trả</p>
          <strong>{{ bookStats.returned }}</strong>
        </div>
      </div>
    </div>

    <!-- Edit Profile Button -->
    <button class="btn btn-primary edit-btn" @click="toggleEditMode">
      {{ editMode ? 'Hủy' : 'Chỉnh sửa thông tin' }}
    </button>

    <!-- Edit Profile Form -->
    <div v-if="editMode" class="edit-profile">
      <h3>Chỉnh Sửa Thông Tin</h3>
      <form @submit.prevent="updateUserProfile">
        <div class="form-group">
          <label for="holot">Họ lót</label>
          <input id="holot" v-model="editUser.HOLOT" type="text" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="ten">Tên</label>
          <input id="ten" v-model="editUser.TEN" type="text" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="ngaysinh">Ngày sinh</label>
          <input id="ngaysinh" v-model="editUser.NGAYSINH" type="date" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="phai">Giới tính</label>
          <select id="phai" v-model="editUser.PHAI" class="form-control" required>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        <div class="form-group">
          <label for="diachi">Địa chỉ</label>
          <input id="diachi" v-model="editUser.DIACHI" type="text" class="form-control" required />
        </div>

        <div class="form-group">
          <label for="sodienthoai">Số điện thoại</label>
          <input id="sodienthoai" v-model="editUser.SODIENTHOAI" type="tel" class="form-control" required />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-success">Lưu thay đổi</button>
          <button type="button" class="btn btn-secondary" @click="toggleEditMode">Hủy</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const defaultAvatar = 'https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg';
const user = ref({});
const editMode = ref(false);
const editUser = ref({});
const borrowedBooks = ref([]);

// Thống kê sách mượn
const bookStats = computed(() => {
  return {
    total: borrowedBooks.value.length,
    pending: borrowedBooks.value.filter(book => book.TRANGTHAI === 0).length,
    borrowing: borrowedBooks.value.filter(book => book.TRANGTHAI === 1).length,
    returned: borrowedBooks.value.filter(book => book.TRANGTHAI === 3).length
  };
});

// Lấy thông tin người dùng và sách mượn
async function fetchProfileData() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user.value = JSON.parse(userStr);
      editUser.value = { ...user.value };
      
      // Lấy danh sách sách đã mượn
      const response = await api.getUserLoanRecords(user.value._id);
      borrowedBooks.value = response;
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
    alert('Có lỗi khi tải thông tin người dùng');
  }
}

// Cập nhật thông tin người dùng
async function updateUserProfile() {
  try {
    const updateData = {
      HOLOT: editUser.value.HOLOT,
      TEN: editUser.value.TEN,
      NGAYSINH: editUser.value.NGAYSINH,
      PHAI: editUser.value.PHAI,
      DIACHI: editUser.value.DIACHI,
      SODIENTHOAI: editUser.value.SODIENTHOAI
    };

    const updatedUser = await api.updateMember(user.value._id, updateData);
    user.value = { ...user.value, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(user.value));
    alert('Cập nhật thông tin thành công!');
    editMode.value = false;
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Có lỗi khi cập nhật thông tin');
  }
}

// Khởi tạo form edit với đầy đủ thông tin
function toggleEditMode() {
  editMode.value = !editMode.value;
  if (!editMode.value) {
    editUser.value = { ...user.value };
  } else {
    // Đảm bảo ngày sinh được format đúng cho input type="date"
    editUser.value = {
      ...user.value,
      NGAYSINH: user.value.NGAYSINH ? new Date(user.value.NGAYSINH).toISOString().split('T')[0] : ''
    };
  }
}

// Format date function
function formatDate(dateString) {
  if (!dateString) return 'Chưa cập nhật';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

onMounted(() => {
  fetchProfileData();
});
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #007bff;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  color: #333;
}

.user-info p {
  margin: 8px 0;
  font-size: 1rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info i {
  width: 20px;
  color: #007bff;
}

.task-stats {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
}

.task-stats h3 {
  margin: 0;
  margin-bottom: 10px;
  font-size: 1.4rem;
  color: #333;
}

.task-stats p {
  margin: 5px 0;
  font-size: 1rem;
  color: #555;
}

.task-stats strong {
  color: #007bff;
}

.edit-profile {
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

.edit-profile h3 {
  margin-bottom: 15px;
}

.edit-profile .form-group {
  margin-bottom: 15px;
}

.edit-profile .form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.edit-profile .form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.edit-btn {
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-item i {
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 10px;
}

.stat-item p {
  margin: 5px 0;
  color: #666;
}

.stat-item strong {
  font-size: 1.5rem;
  color: #28a745;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.book-stats {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
}

.form-control {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}
</style>
