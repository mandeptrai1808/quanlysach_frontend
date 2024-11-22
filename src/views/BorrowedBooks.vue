<template>
  <div class="borrowed-books">
    <h2 class="text-center mb-4">Sách đã mượn</h2>
    
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th>Ngày mượn</th>
                  <th>Ngày trả</th>
                  <th>Giá tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in sortedBorrowedBooks" :key="record._id">
                  <td>{{ record.SACH.TENSACH }}</td>
                  <td>{{ formatDate(record.NGAYMUON) }}</td>
                  <td>{{ formatDate(record.NGAYTRA) }}</td>
                  <td>{{ formatCurrency(record.SACH.DONGIA) }}</td>
                  <td>
                    <span :class="getStatusBadgeClass(record.TRANGTHAI)">
                      {{ getStatusText(record.TRANGTHAI) }}
                    </span>
                  </td>
                  <td>
                    <button 
                      v-if="record.TRANGTHAI === 0"
                      class="btn btn-danger btn-sm"
                      @click="cancelBorrow(record._id)"
                    >
                      Hủy mượn
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="activeBorrowedBooks.length > 0">
                <tr class="table-info">
                  <td colspan="3"><strong>Tổng tiền:</strong></td>
                  <td colspan="3">
                    <strong>{{ formatCurrency(totalAmount) }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Phần thanh toán -->
            <div v-if="activeBorrowedBooks.length > 0" class="payment-section mt-4 text-end">
              <div class="card p-3">
                <h5>Chi tiết thanh toán</h5>
                <div class="mb-2">
                  <span>Số lượng sách: {{ activeBorrowedBooks.length }}</span>
                </div>
                <div class="mb-3">
                  <strong>Tổng tiền: {{ formatCurrency(totalAmount) }}</strong>
                </div>
                <button class="btn btn-primary" @click="handlePayment">
                  Thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const borrowedBooks = ref([]);

// Sắp xếp sách theo trạng thái
const sortedBorrowedBooks = computed(() => {
  return [...borrowedBooks.value].sort((a, b) => {
    // Đưa sách đã hủy xuống cuối
    if (a.TRANGTHAI === 4 && b.TRANGTHAI !== 4) return 1;
    if (a.TRANGTHAI !== 4 && b.TRANGTHAI === 4) return -1;
    // Sắp xếp theo ngày mượn mới nhất
    return new Date(b.NGAYMUON) - new Date(a.NGAYMUON);
  });
});

// Lọc sách đang mượn (không bao gồm đã hủy và đã trả)
const activeBorrowedBooks = computed(() => {
  return borrowedBooks.value.filter(record => 
    record.TRANGTHAI !== 3 && record.TRANGTHAI !== 2
  );
});

// Tính tổng tiền
const totalAmount = computed(() => {
  return activeBorrowedBooks.value.reduce((total, record) => 
    total + record.SACH.DONGIA, 0
  );
});

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
}

// Xử lý thanh toán
async function handlePayment() {
  try {
    if (confirm('Bạn có chắc muốn thanh toán?')) {
      // Thêm logic thanh toán ở đây
      alert('Thanh toán thành công!');
      await fetchBorrowedBooks();
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    alert('Có lỗi xảy ra khi thanh toán!');
  }
}

// Fetch borrowed books
async function fetchBorrowedBooks() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const response = await api.getUserLoanRecords(user._id);
      borrowedBooks.value = response;
    }
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
  }
}

// Cancel borrow function
async function cancelBorrow(recordId) {
  try {
    if (confirm('Bạn có chắc muốn hủy mượn sách này?')) {
      await api.updateLoanRecord(recordId, 3);
      alert('Đã hủy mượn sách thành công!');
      await fetchBorrowedBooks();
    }
  } catch (error) {
    console.error('Error canceling borrow:', error);
    alert('Có lỗi xảy ra khi hủy mượn sách!');
  }
}

// Helper functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}

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

onMounted(fetchBorrowedBooks);
</script>

<style scoped>
.borrowed-books {
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

.payment-section {
  max-width: 400px;
  margin-left: auto;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table-info {
  background-color: #e3f2fd;
}

/* Hover effects */
.btn-primary:hover {
  opacity: 0.9;
}

.btn-danger:hover {
  opacity: 0.9;
}
</style>
  