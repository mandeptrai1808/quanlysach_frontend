<template>
  <div class="user-management">
    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Tổng số độc giả</h5>
            <p class="card-text">{{ members.length }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Độc giả Nam</h5>
            <p class="card-text">{{ getMembersByGender('Nam') }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Độc giả Nữ</h5>
            <p class="card-text">{{ getMembersByGender('Nữ') }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Độc giả mới (tháng này)</h5>
            <p class="card-text">{{ getNewMembersThisMonth() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý độc giả</h2>
      <div class="d-flex gap-3">
        <div class="filters d-flex gap-2">
          <select v-model="genderFilter" class="form-select">
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control" 
            placeholder="Tìm kiếm độc giả..."
          >
        </div>
        <button class="btn btn-primary" @click="openAddModal">
          <i class="fas fa-plus"></i> Thêm độc giả
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Mã độc giả</th>
            <th>Họ và tên</th>
            <th>Ngày sinh</th>
            <th>Giới tính</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredMembers.length === 0">
            <td colspan="7" class="text-center">Không có độc giả nào</td>
          </tr>
          <tr v-for="member in filteredMembers" :key="member._id">
            <td>{{ member.MADOCGIA }}</td>
            <td>{{ member.HOLOT }} {{ member.TEN }}</td>
            <td>{{ formatDate(member.NGAYSINH) }}</td>
            <td>{{ member.PHAI }}</td>
            <td>{{ member.DIACHI }}</td>
            <td>{{ member.SODIENTHOAI }}</td>
            <td>{{ formatDate(member.createdAt) }}</td>
            <td>
              <button 
                class="btn btn-sm btn-info me-1" 
                @click="openEditModal(member)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn btn-sm btn-danger"
                @click="handleDelete(member)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Thêm/Sửa độc giả -->
    <div class="modal fade" id="memberModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Chỉnh sửa độc giả' : 'Thêm độc giả mới' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Mã độc giả</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="memberForm.MADOCGIA" 
                  required
                  :disabled="isEditing"
                >
              </div>
              <div class="col-md-6">
                <label class="form-label">Mật khẩu</label>
                <input 
                  type="password" 
                  class="form-control" 
                  v-model="memberForm.MATKHAU" 
                  :required="!isEditing"
                >
                <small class="text-muted" v-if="isEditing">
                  Để trống nếu không muốn thay đổi mật khẩu
                </small>
              </div>
              <div class="col-md-6">
                <label class="form-label">Họ và tên lót</label>
                <input type="text" class="form-control" v-model="memberForm.HOLOT" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tên</label>
                <input type="text" class="form-control" v-model="memberForm.TEN" required>
              </div>
              <div class="col-12">
                <label class="form-label">Ngày sinh</label>
                <input type="date" class="form-control" v-model="memberForm.NGAYSINH" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Giới tính</label>
                <select class="form-select" v-model="memberForm.PHAI" required>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Số điện thoại</label>
                <input type="tel" class="form-control" v-model="memberForm.SODIENTHOAI">
              </div>
              <div class="col-12">
                <label class="form-label">Địa chỉ</label>
                <input type="text" class="form-control" v-model="memberForm.DIACHI" required>
              </div>
              <div class="col-12 text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                  Hủy
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import api from '@/services/api';

// State
const members = ref([]);
const loading = ref(true);
const genderFilter = ref('');
const searchQuery = ref('');
const memberModal = ref(null);
const isEditing = ref(false);
const memberForm = ref({
  MADOCGIA: '',
  MATKHAU: '',
  HOLOT: '',
  TEN: '',
  NGAYSINH: '',
  PHAI: 'Nam',
  DIACHI: '',
  SODIENTHOAI: ''
});

// Computed
const filteredMembers = computed(() => {
  return members.value.filter(member => {
    const matchesGender = genderFilter.value === '' || member.PHAI === genderFilter.value;
    const searchTerm = searchQuery.value.toLowerCase();
    const matchesSearch = 
      `${member.HOLOT} ${member.TEN}`.toLowerCase().includes(searchTerm) ||
      member.MADOCGIA.toLowerCase().includes(searchTerm) ||
      member.SODIENTHOAI?.includes(searchTerm);
    return matchesGender && matchesSearch;
  });
});

// Methods
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

async function fetchMembers() {
  try {
    loading.value = true;
    const response = await api.getAllMember();
    members.value = response;
  } catch (error) {
    console.error('Error fetching members:', error);
    alert('Có lỗi xảy ra khi tải dữ liệu');
  } finally {
    loading.value = false;
  }
}

// Stats methods
function getMembersByGender(gender) {
  return members.value.filter(member => member.PHAI === gender).length;
}

function getNewMembersThisMonth() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return members.value.filter(member => new Date(member.createdAt) >= startOfMonth).length;
}

// Modal methods
function openAddModal() {
  isEditing.value = false;
  memberForm.value = {
    MADOCGIA: generateMemberCode(),
    MATKHAU: '',
    HOLOT: '',
    TEN: '',
    NGAYSINH: '',
    PHAI: 'Nam',
    DIACHI: '',
    SODIENTHOAI: ''
  };
  memberModal.value.show();
}

function openEditModal(member) {
  isEditing.value = true;
  memberForm.value = {
    _id: member._id,
    MADOCGIA: member.MADOCGIA,
    MATKHAU: member.MATKHAU,
    HOLOT: member.HOLOT,
    TEN: member.TEN,
    NGAYSINH: new Date(member.NGAYSINH).toISOString().split('T')[0],
    PHAI: member.PHAI,
    DIACHI: member.DIACHI,
    SODIENTHOAI: member.SODIENTHOAI
  };
  memberModal.value.show();
}

async function handleSubmit() {
  try {
    if (isEditing.value) {
      const updateData = { ...memberForm.value };
      if (!updateData.MATKHAU) {
        delete updateData.MATKHAU;
      }
      await api.updateMember(memberForm.value._id, updateData);
      alert('Cập nhật độc giả thành công!');
    } else {
      await api.registerMember(memberForm.value);
      alert('Thêm độc giả mới thành công!');
    }
    await fetchMembers();
    memberModal.value.hide();
  } catch (error) {
    console.error('Error submitting member:', error);
    alert(error.message || 'Có lỗi xảy ra khi lưu thông tin!');
  }
}

async function handleDelete(member) {
  if (confirm(`Bạn có chắc muốn xóa độc giả ${member.HOLOT} ${member.TEN}?`)) {
    try {
      await api.deleteMember(member._id);
      await fetchMembers();
      alert('Xóa độc giả thành công!');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa độc giả!');
    }
  }
}

// Lifecycle hooks
onMounted(() => {
  memberModal.value = new Modal(document.getElementById('memberModal'));
  fetchMembers();
});

// Helper function to generate member code
function generateMemberCode() {
  const lastMember = members.value
    .map(m => parseInt(m.MADOCGIA.replace('DG', '')))
    .sort((a, b) => b - a)[0] || 0;
  const newCode = (lastMember + 1).toString().padStart(3, '0');
  return `DG${newCode}`;
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table th {
  background-color: #f8f9fa;
  white-space: nowrap;
}

.table td {
  vertical-align: middle;
}

.filters {
  max-width: 500px;
}

.form-select, .form-control {
  min-width: 200px;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}
</style> 