<template>
  <div class="dashboard">
    <!-- Thống kê tổng quan -->
    <div class="stats-overview">
      <div class="row">
        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-book"></i>
            </div>
            <div class="stat-details">
              <h3>{{ stats.totalBooks || 0 }}</h3>
              <p>Tổng số sách</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-details">
              <h3>{{ stats.totalMembers || 0 }}</h3>
              <p>Độc giả</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-book-reader"></i>
            </div>
            <div class="stat-details">
              <h3>{{ stats.activeBorrows || 0 }}</h3>
              <p>Đang mượn</p>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-details">
              <h3>{{ stats.pendingReturns || 0 }}</h3>
              <p>Chờ trả</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phiếu mượn gần đây -->
    <div class="recent-section">
      <div class="section-header">
        <h2>Phiếu mượn gần đây</h2>
        <router-link to="/admin/borrows" class="btn btn-primary btn-sm">
          Xem tất cả
        </router-link>
      </div>
      
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Mã độc giả</th>
              <th>Họ tên</th>
              <th>Tên sách</th>
              <th>Ngày mượn</th>
              <th>Ngày trả</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!recentBorrows.length">
              <td colspan="7" class="text-center">Không có phiếu mượn nào</td>
            </tr>
            <tr v-for="borrow in recentBorrows" :key="borrow._id">
              <td>{{ borrow.DOCGIA.MADOCGIA }}</td>
              <td>{{ borrow.DOCGIA.HOLOT }} {{ borrow.DOCGIA.TEN }}</td>
              <td>{{ borrow.SACH.TENSACH }}</td>
              <td>{{ formatDate(borrow.NGAYMUON) }}</td>
              <td>
                <span :class="isOverdue(borrow.NGAYTRA) ? 'text-danger' : ''">
                  {{ formatDate(borrow.NGAYTRA) }}
                </span>
              </td>
              <td>
                <span :class="getBorrowStatusClass(borrow.TRANGTHAI)">
                  {{ getBorrowStatusText(borrow.TRANGTHAI) }}
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
    </div>

    <!-- Sách phổ biến -->
    <div class="popular-books">
      <div class="section-header">
        <h2>Sách được mượn nhiều</h2>
        <router-link to="/admin/books" class="btn btn-primary btn-sm">
          Quản lý sách
        </router-link>
      </div>

      <div class="row">
        <div v-for="book in popularBooks" :key="book._id" class="col-md-3">
          <div class="book-card">
            <img :src="book.HINHANH || '/default-book.jpg'" :alt="book.TENSACH">
            <div class="book-info">
              <h4>{{ book.TENSACH }}</h4>
              <p>Số lượt mượn: {{ book.borrowCount }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const loading = ref(true);
const error = ref(null);
const stats = ref({
  totalBooks: 0,
  totalMembers: 0,
  activeBorrows: 0,
  pendingReturns: 0
});
const recentBorrows = ref([]);
const popularBooks = ref([]);

// Fetch và xử lý dữ liệu dashboard
async function fetchDashboardData() {
  try {
    loading.value = true;
    error.value = null;

    // Lấy tất cả dữ liệu cần thiết
    const [books, members, borrows] = await Promise.all([
      api.getAllBooks(),
      api.getAllMember(),
      api.getAllBorrows()
    ]);

    // Tính toán thống kê
    stats.value = {
      totalBooks: books.length,
      totalMembers: members.length,
      activeBorrows: borrows.filter(b => b.TRANGTHAI === 1).length,
      pendingReturns: borrows.filter(b => b.TRANGTHAI === 0).length
    };

    // Xử lý phiếu mượn gần đây (5 phiếu mới nhất)
    recentBorrows.value = borrows
      .sort((a, b) => new Date(b.NGAYMUON) - new Date(a.NGAYMUON))
      .slice(0, 5);

    // Tính toán sách phổ biến
    const bookBorrowCounts = borrows.reduce((acc, borrow) => {
      const bookId = borrow.MASACH;
      acc[bookId] = (acc[bookId] || 0) + 1;
      return acc;
    }, {});

    // Lấy top 4 sách được mượn nhiều nhất
    popularBooks.value = books
      .map(book => ({
        ...book,
        borrowCount: bookBorrowCounts[book.MASACH] || 0
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 4);

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    error.value = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
  } finally {
    loading.value = false;
  }
}

// Kiểm tra quá hạn
function isOverdue(dueDate) {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

// Xử lý xác thực sách
async function handleVerify(borrowId) {
  try {
    if (confirm('Xác nhận cho mượn sách?')) {
      // Cập nhật trạng thái từ "Đang xác thực" (0) sang "Đang mượn" (1)
      await api.updateLoanRecord(borrowId, 1);

      // Refresh data
      await fetchDashboardData();
      alert('Xác thực thành công!');
    }
  } catch (error) {
    console.error('Error verifying loan:', error);
    alert('Có lỗi xảy ra khi xác thực');
  }
}

// Xử lý trả sách
async function handleReturn(borrowId) {
  try {
    if (confirm('Xác nhận trả sách?')) {
      // Cập nhật trạng thái từ "Đang mượn" (1) sang "Đã trả" (2)
      await api.updateLoanRecord(borrowId, 2);

      // Refresh data
      await fetchDashboardData();
      alert('Trả sách thành công!');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    alert('Có lỗi xảy ra khi trả sách');
  }
}

// Format date với thời gian
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Get status class based on numeric status
function getBorrowStatusClass(status) {
  const classes = {
    0: 'badge bg-info',       // Đang xác thực
    1: 'badge bg-warning',    // Đang mượn
    2: 'badge bg-success',    // Đã trả
    3: 'badge bg-secondary'   // Đã hủy
  };
  return classes[status] || 'badge bg-secondary';
}

// Get status text based on numeric status
function getBorrowStatusText(status) {
  const texts = {
    0: 'Đang xác thực',
    1: 'Đang mượn',
    2: 'Đã trả',
    3: 'Đã hủy'
  };
  return texts[status] || 'Không xác định';
}

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-overview {
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 24px;
  color: white;
}

.stat-details h3 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.stat-details p {
  margin: 5px 0 0;
  color: #666;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recent-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.book-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.book-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.book-info {
  padding: 15px;
}

.book-info h4 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: bold;
}

.book-info p {
  margin: 0;
  color: #666;
}

.badge {
  padding: 5px 10px;
}

@media (max-width: 768px) {
  .stat-card {
    margin-bottom: 15px;
  }
  
  .book-card img {
    height: 150px;
  }
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.table td {
  vertical-align: middle;
}

.badge {
  font-size: 0.85em;
  padding: 0.5em 0.8em;
}

.text-danger {
  font-weight: 600;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn i {
  margin-right: 4px;
}

.btn-info {
  color: white;
}

.btn-info:hover {
  color: white;
  background-color: #0dcaf0;
}
</style>
