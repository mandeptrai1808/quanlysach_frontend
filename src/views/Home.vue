<template>
  <div class="home-page">
    <h2 class="text-center mb-4">Danh sách sách</h2>
    
    <div class="container-fluid px-4">
      <div class="row">
        <!-- Sidebar Filter -->
        <div class="col-lg-2 col-md-3 sidebar-container">
          <div class="filter-sidebar card">
            <div class="card-body">
              <h5 class="card-title mb-3">Bộ lọc tìm kiếm</h5>
              
              <!-- Filter by Category -->
              <div class="filter-section mb-4">
                <h6 class="filter-title">Thể loại</h6>
                <div class="category-list">
                  <div class="form-check" v-for="category in categories" :key="category._id">
                    <input 
                      class="form-check-input" 
                      type="checkbox"
                      :id="category._id"
                      :value="category._id"
                      v-model="selectedCategories"
                    >
                    <label class="form-check-label" :for="category._id">
                      {{ category.TENTHELOAI }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Filter by Price -->
              <div class="filter-section">
                <h6 class="filter-title">Khoảng giá</h6>
                <div class="price-range">
                  <div class="mb-3">
                    <label class="form-label">Từ:</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="priceRange.min"
                      placeholder="Giá thấp nhất"
                    >
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Đến:</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      v-model="priceRange.max"
                      placeholder="Giá cao nhất"
                    >
                  </div>
                </div>
              </div>

              <!-- Reset Filters Button -->
              <button class="btn btn-secondary w-100 mt-3" @click="resetFilters">
                <i class="fas fa-redo me-2"></i>Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-10 col-md-9 content-container">
          <!-- Search Section -->
          <div class="search-section mb-4">
            <div class="card">
              <div class="card-body">
                <div class="row align-items-center justify-content-center g-3">
                  <div class="col-md-4">
                    <div class="search-input">
                      <input
                        type="text"
                        class="form-control"
                        v-model="searchQuery"
                        placeholder="Nhập từ khóa tìm kiếm..."
                      >
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="search-select">
                      <select class="form-select" v-model="searchType">
                        <option value="TENSACH">Tên sách</option>
                        <option value="TACGIA">Tác giả</option>
                        <option value="NHAXUATBAN.TENNXB">Nhà xuất bản</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="search-button">
                      <button class="btn btn-primary w-100" @click="handleSearch" style="margin: 0;">
                        <i class="fas fa-search me-2"></i>Tìm kiếm
                      </button>
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="search-button">
                      <button class="btn btn-secondary w-100" @click="resetSearch">
                        <i class="fas fa-redo me-2"></i>Đặt lại
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Books Grid -->
          <div class="books-grid">
            <div v-for="book in filteredBooks" :key="book._id" class="book-card">
              <img :src="book.HINHANH || '/default-book.jpg'" :alt="book.TENSACH" class="book-image">
              <div class="book-info">
                <h3 class="book-title">{{ book.TENSACH }}</h3>
                <p class="book-author"><strong>Tác giả:</strong> {{ book.TACGIA }}</p>
                <p class="book-category"><strong>Thể loại:</strong> {{ book.THELOAI.TENTHELOAI }}</p>
                <p class="book-price"><strong>Giá:</strong> {{ formatCurrency(book.DONGIA) }}</p>
                <p class="book-quantity"><strong>Số lượng còn:</strong> {{ book.SOQUYEN }}</p>
                <button 
                  class="btn w-100 mt-2"
                  :class="{
                    'btn-primary': !isBookBorrowed(book._id) && book.SOQUYEN > 0,
                    'btn-secondary': !isBookBorrowed(book._id) && book.SOQUYEN <= 0
                  }"
                  @click="openBorrowModal(book)"
                  :disabled="isBookBorrowed(book._id) || book.SOQUYEN <= 0"
                >
                  <span v-if="book.SOQUYEN <= 0">Hết sách</span>
                  <span v-else>Mượn sách</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Borrow Modal -->
    <div class="modal fade" id="borrowModal" tabindex="-1" ref="borrowModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Mượn sách</h5>
            <button type="button" class="btn-close" @click="closeBorrowModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitBorrowForm">
              <div class="mb-3">
                <label class="form-label">Tên sách:</label>
                <input type="text" class="form-control" :value="selectedBook?.TENSACH" disabled>
              </div>
              <div class="mb-3">
                <label class="form-label">Ngày mượn:</label>
                <input 
                  type="date" 
                  class="form-control"
                  v-model="borrowForm.NGAYMUON"
                  required
                  :min="getCurrentDate()"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Ngày trả:</label>
                <input 
                  type="date" 
                  class="form-control"
                  v-model="borrowForm.NGAYTRA"
                  required
                  :min="borrowForm.NGAYMUON"
                >
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeBorrowModal">Hủy</button>
                <button type="submit" class="btn btn-primary">Xác nhận mượn</button>
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

// Refs
const books = ref([]);
const borrowedBooks = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const searchType = ref('TENSACH');
const selectedCategories = ref([]);
const priceRange = ref({
  min: '',
  max: ''
});
const selectedBook = ref(null);
const borrowModal = ref(null);
const borrowForm = ref({
  NGAYMUON: getCurrentDate(),
  NGAYTRA: ''
});

// Helper functions
function getCurrentDateTime() {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
}

function isBookBorrowed(bookId) {
  return borrowedBooks.value.some(record => 
    record.SACH._id === bookId && 
    [0, 1, 2].includes(record.TRANGTHAI)
  );
}

// API calls
async function fetchBooks() {
  try {
    const response = await api.getBooks();
    books.value = response;
  } catch (error) {
    console.error('Error fetching books:', error);
  }
}

async function fetchBorrowedBooks() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const response = await api.getUserLoanRecords(user._id);
      console.log('Borrowed books:', response);
      borrowedBooks.value = response;
    }
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
  }
}

async function fetchCategories() {
  try {
    const response = await api.getCategories();
    categories.value = response;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Open borrow modal
function openBorrowModal(book) {
  selectedBook.value = book;
  borrowForm.value = {
    NGAYMUON: getCurrentDate(),
    NGAYTRA: ''
  };
  const modal = new Modal(borrowModal.value);
  modal.show();
}

// Close borrow modal
function closeBorrowModal() {
  const modal = Modal.getInstance(borrowModal.value);
  if (modal) {
    modal.hide();
  }
}

// Submit borrow form
async function submitBorrowForm() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Vui lòng đăng nhập để mượn sách!');
      return;
    }

    const loanData = {
      MADOCGIA: user._id,
      MASACH: selectedBook.value._id,
      NGAYMUON: borrowForm.value.NGAYMUON,
      NGAYTRA: borrowForm.value.NGAYTRA,
      TRANGTHAI: 0
    };
    console.log(loanData);
    await api.createLoanRecord(loanData);
    alert('Yêu cầu mượn sách đã được gửi!');
    closeBorrowModal();
    await fetchBorrowedBooks();
  } catch (error) {
    console.error('Error borrowing book:', error);
    alert('Có lỗi xảy ra khi mượn sách!');
  }
}

// Filter functions
function resetFilters() {
  selectedCategories.value = [];
  priceRange.value = {
    min: '',
    max: ''
  };
  searchQuery.value = '';
}

// Computed properties
const filteredBooks = computed(() => {
  let result = books.value;

  if (searchQuery.value) {
    const searchValue = searchQuery.value.toLowerCase();
    result = result.filter(book => {
      if (searchType.value === 'NHAXUATBAN.TENNXB') {
        return book.NHAXUATBAN.TENNXB.toLowerCase().includes(searchValue);
      }
      return book[searchType.value].toLowerCase().includes(searchValue);
    });
  }

  if (selectedCategories.value.length > 0) {
    result = result.filter(book => 
      selectedCategories.value.includes(book.THELOAI._id)
    );
  }

  if (priceRange.value.min !== '') {
    result = result.filter(book => book.DONGIA >= Number(priceRange.value.min));
  }
  if (priceRange.value.max !== '') {
    result = result.filter(book => book.DONGIA <= Number(priceRange.value.max));
  }

  return result;
});

// Lifecycle hooks
onMounted(async () => {
  try {
    await Promise.all([
      fetchBooks(),
      fetchCategories(),
      fetchBorrowedBooks()
    ]);
    console.log('Initial load complete');
    console.log('Books:', books.value);
    console.log('Borrowed books:', borrowedBooks.value);
  } catch (error) {
    console.error('Error during initial load:', error);
  }

  borrowModal.value = document.getElementById('borrowModal');
});
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.book-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.book-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.book-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author,
.book-category,
.book-price,
.book-quantity {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #666;
}

.btn-primary {
  margin-top: auto;
}

/* Responsive Design */
@media (min-width: 1400px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 1399px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 991px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .book-image {
    height: 200px;
  }

  .book-info {
    padding: 0.8rem;
  }
}

@media (max-width: 576px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .book-image {
    height: 180px;
  }
}

.container-fluid {
  max-width: 1800px; /* Tăng max-width để hiển thị nhiều sách hơn */
}

.filter-sidebar {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 20px;
}

.filter-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.filter-section {
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.filter-section:last-child {
  border-bottom: none;
}

.category-list {
  max-height: 300px;
  overflow-y: auto;
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check-label {
  color: #666;
  cursor: pointer;
}

.form-check-input:checked + .form-check-label {
  color: #2c3e50;
  font-weight: 500;
}

.price-range .form-control {
  border-radius: 6px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-sidebar {
    position: static;
    margin-bottom: 20px;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

.sidebar-container {
  min-width: 250px;
  max-width: 300px;
  padding-right: 20px;
}

.filter-sidebar {
  position: sticky;
  top: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: white;
  height: calc(100vh - 40px);
  overflow-y: auto;
}

.filter-sidebar .card-body {
  padding: 1.25rem;
}

.filter-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.category-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
  padding-right: 5px;
}

.category-list::-webkit-scrollbar {
  width: 6px;
}

.category-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.category-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.form-check {
  margin-bottom: 0.5rem;
  padding-left: 1.8rem;
}

.form-check-input {
  margin-left: -1.8rem;
}

.form-check-label {
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1.4;
}

.price-range .form-control {
  font-size: 0.9rem;
}

.price-range .form-label {
  font-size: 0.9rem;
  color: #666;
}

/* Responsive Design */
@media (max-width: 991px) {
  .sidebar-container {
    min-width: 100%;
    max-width: 100%;
    padding-right: 12px;
    margin-bottom: 20px;
  }

  .filter-sidebar {
    position: static;
    height: auto;
  }

  .category-list {
    max-height: 200px;
  }
}

/* Content container styles */
.content-container {
  flex: 1;
  min-height: 100vh;
}

/* Container fluid max-width */
.container-fluid {
  max-width: 1800px;
  margin: 0 auto;
}

.modal-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.modal-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.form-label {
  font-weight: 500;
}
</style>