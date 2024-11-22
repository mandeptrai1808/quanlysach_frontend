<template>
  <div class="borrow-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý phiếu mượn</h2>
      <div class="filters d-flex gap-3">
        <select v-model="statusFilter" class="form-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="0">Đang xác thực</option>
          <option value="1">Đang mượn</option>
          <option value="2">Đã trả</option>
          <option value="3">Đã hủy</option>
        </select>
        <input 
          type="text" 
          v-model="searchQuery" 
          class="form-control" 
          placeholder="Tìm kiếm theo tên độc giả hoặc tên sách..."
        >
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Mã độc giả</th>
            <th>Tên độc giả</th>
            <th>Tên sách</th>
            <th>Ngày mượn</th>
            <th>Ngày trả</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
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
          <tr v-else-if="filteredBorrows.length === 0">
            <td colspan="7" class="text-center">Không có phiếu mượn nào</td>
          </tr>
          <tr v-for="borrow in filteredBorrows" :key="borrow._id">
            <td>{{ borrow.DOCGIA?.MADOCGIA || 'N/A' }}</td>
            <td>{{ borrow.DOCGIA ? `${borrow.DOCGIA.HOLOT} ${borrow.DOCGIA.TEN}` : 'N/A' }}</td>
            <td>{{ borrow.SACH.TENSACH }}</td>
            <td>{{ formatDate(borrow.NGAYMUON) }}</td>
            <td>
              <span :class="isOverdue(borrow.NGAYTRA) ? 'text-danger' : ''">
                {{ formatDate(borrow.NGAYTRA) }}
              </span>
            </td>
            <td>
              <span :class="getStatusBadgeClass(borrow.TRANGTHAI)">
                {{ getStatusText(borrow.TRANGTHAI) }}
              </span>
            </td>
            <td>
              <button 
                v-if="borrow.TRANGTHAI === 0"
                class="btn btn-sm btn-info me-1"
                @click="handleVerify(borrow._id)"
              >
                <i class="fas fa-check-circle"></i> Xác thực
              </button>
              <button 
                v-if="borrow.TRANGTHAI === 1"
                class="btn btn-sm btn-success me-1"
                @click="handleReturn(borrow._id)"
              >
                <i class="fas fa-check"></i> Trả sách
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Thống kê -->
    <div class="stats-cards row mt-4">
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Tổng số phiếu</h5>
            <p class="card-text">{{ borrows.length }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Đang xác thực</h5>
            <p class="card-text">{{ getPendingCount }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Đang mượn</h5>
            <p class="card-text">{{ getActiveCount }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Đã trả</h5>
            <p class="card-text">{{ getReturnedCount }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

// State
const borrows = ref([]);
const loading = ref(true);
const statusFilter = ref('all');
const searchQuery = ref('');

// Computed
const filteredBorrows = computed(() => {
  return borrows.value.filter(borrow => {
    if (!borrow.DOCGIA) return false;

    const searchTerm = searchQuery.value.toLowerCase();
    const matchesSearch = 
      (borrow.DOCGIA?.HOLOT + ' ' + borrow.DOCGIA?.TEN)?.toLowerCase().includes(searchTerm) ||
      borrow.SACH?.TENSACH?.toLowerCase().includes(searchTerm);

    const matchesStatus = statusFilter.value === 'all' || 
      Number(statusFilter.value) === borrow.TRANGTHAI;

    return matchesSearch && matchesStatus;
  });
});

const getPendingCount = computed(() => 
  borrows.value.filter(b => b.TRANGTHAI === 0).length
);

const getActiveCount = computed(() => 
  borrows.value.filter(b => b.TRANGTHAI === 1).length
);

const getReturnedCount = computed(() => 
  borrows.value.filter(b => b.TRANGTHAI === 2).length
);

// Methods
function getStatusText(status) {
  const statusMap = {
    0: 'Đang xác thực',
    1: 'Đang mượn',
    2: 'Đã trả',
    3: 'Đã hủy'
  };
  return statusMap[status] || 'Không xác định';
}

function getStatusBadgeClass(status) {
  const classMap = {
    0: 'badge bg-info',
    1: 'badge bg-warning',
    2: 'badge bg-success',
    3: 'badge bg-secondary'
  };
  return classMap[status] || 'badge bg-secondary';
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}

function isOverdue(dateString) {
  return new Date(dateString) < new Date();
}

async function handleVerify(borrowId) {
  try {
    if (confirm('Xác nhận cho mượn sách?')) {
      await api.updateLoanRecord(borrowId, 1);
      await fetchBorrows();
      alert('Xác thực thành công!');
    }
  } catch (error) {
    console.error('Error verifying loan:', error);
    alert('Có lỗi xảy ra khi xác thực');
  }
}

async function handleReturn(borrowId) {
  try {
    if (confirm('Xác nhận trả sách?')) {
      await api.updateLoanRecord(borrowId, 2);
      await fetchBorrows();
      alert('Trả sách thành công!');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    alert('Có lỗi xảy ra khi trả sách');
  }
}

async function fetchBorrows() {
  try {
    loading.value = true;
    const response = await api.getAllBorrows();
    borrows.value = response;
  } catch (error) {
    console.error('Error fetching borrows:', error);
    alert('Có lỗi xảy ra khi tải dữ liệu');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchBorrows);
</script>

<style scoped>
.borrow-management {
  padding: 20px;
}

.table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.badge {
  padding: 8px 12px;
  font-size: 0.9rem;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
}

.btn i {
  margin-right: 4px;
}

.text-danger {
  font-weight: 600;
}

.filters {
  max-width: 500px;
}

.form-select, .form-control {
  min-width: 200px;
}
</style> 