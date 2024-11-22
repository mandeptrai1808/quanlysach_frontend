<template>
  <div class="book-management">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sách</h2>
      <div class="d-flex gap-3">
        <div class="filters d-flex gap-2">
          <select v-model="categoryFilter" class="form-select">
            <option value="">Tất cả thể loại</option>
            <option v-for="category in categories" 
                    :key="category._id" 
                    :value="category._id">
              {{ category.TENTHELOAI }}
            </option>
          </select>
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control" 
            placeholder="Tìm kiếm sách..."
          >
        </div>
        <button class="btn btn-primary" @click="openAddModal">
          <i class="fas fa-plus"></i> Thêm sách mới
        </button>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Tên sách</th>
            <th>Thể loại</th>
            <th>Tác giả</th>
            <th>NXB</th>
            <th>Năm XB</th>
            <th>Số quyển</th>
            <th>Đơn giá</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredBooks.length === 0">
            <td colspan="9" class="text-center">Không có sách nào</td>
          </tr>
          <tr v-for="book in filteredBooks" :key="book._id">
            <td>
              <img :src="book.HINHANH" 
                   :alt="book.TENSACH" 
                   class="book-thumbnail"
                   @error="handleImageError">
            </td>
            <td>{{ book.TENSACH }}</td>
            <td>{{ getCategoryName(book.THELOAI) }}</td>
            <td>{{ book.TACGIA }}</td>
            <td>{{ getPublisherName(book.NHAXUATBAN) }}</td>
            <td>{{ book.NAMXUATBAN }}</td>
            <td>{{ book.SOQUYEN }}</td>
            <td>{{ formatCurrency(book.DONGIA) }}</td>
            <td>
              <button 
                class="btn btn-sm btn-info me-1" 
                @click="openEditModal(book)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                class="btn btn-sm btn-danger"
                @click="handleDelete(book._id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Thêm/Sửa sách -->
    <div class="modal fade" id="bookModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Tên sách</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="bookForm.TENSACH" 
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label">Thể loại</label>
                <select class="form-select" v-model="bookForm.THELOAI" required>
                  <option v-for="category in categories" 
                          :key="category._id" 
                          :value="category._id">
                    {{ category.TENTHELOAI }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tác giả</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="bookForm.TACGIA" 
                  required
                >
              </div>
              <div class="col-md-6">
                <label class="form-label">Nhà xuất bản</label>
                <select class="form-select" v-model="bookForm.NHAXUATBAN" required>
                  <option v-for="publisher in publishers" 
                          :key="publisher._id" 
                          :value="publisher._id">
                    {{ publisher.TENNXB }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Năm xuất bản</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model="bookForm.NAMXUATBAN" 
                  required
                >
              </div>
              <div class="col-md-4">
                <label class="form-label">Số quyển</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model="bookForm.SOQUYEN" 
                  required
                >
              </div>
              <div class="col-md-4">
                <label class="form-label">Đơn giá</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="bookForm.DONGIA" 
                  min="0"
                  required
                >
              </div>
              <div class="col-12">
                <label class="form-label">Hình ảnh URL</label>
                <input 
                  type="url" 
                  class="form-control" 
                  v-model="bookForm.HINHANH"
                >
              </div>
              <div class="col-12">
                <label class="form-label">Mô tả</label>
                <textarea 
                  class="form-control" 
                  v-model="bookForm.MOTA" 
                  rows="3"
                ></textarea>
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
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import api from '@/services/api';

// State
const books = ref([]);
const categories = ref([]);
const publishers = ref([]);
const loading = ref(true);
const categoryFilter = ref('');
const searchQuery = ref('');
const isEditing = ref(false);
const bookModal = ref(null);
const bookForm = ref({
  TENSACH: '',
  THELOAI: '',
  TACGIA: '',
  NHAXUATBAN: '',
  NAMXUATBAN: new Date().getFullYear(),
  SOQUYEN: 1,
  DONGIA: 0,
  HINHANH: '',
  MOTA: ''
});

// Lifecycle hook
onMounted(async () => {
  bookModal.value = new Modal(document.getElementById('bookModal'));
  await fetchData();
});

// Fetch data
async function fetchData() {
  try {
    loading.value = true;
    const booksData = await api.getBooks();
    books.value = booksData;
    
    const [categoriesData, publishersData] = await Promise.all([
      api.getCategories(),
      api.getAllPublishers()
    ]);
    categories.value = categoriesData;
    publishers.value = publishersData;
  } catch (error) {
    console.error('Error fetching data:', error);
    alert(error.message || 'Có lỗi xảy ra khi tải dữ liệu!');
  } finally {
    loading.value = false;
  }
}

// Refresh books list
async function refreshBooks() {
  try {
    const booksData = await api.getBooks();
    books.value = booksData;
  } catch (error) {
    console.error('Error refreshing books:', error);
    alert(error.message || 'Có lỗi xảy ra khi tải lại danh sách sách!');
  }
}

// Update submit handler
async function handleSubmit() {
  try {
    console.log('isEditing:', isEditing.value);
    console.log('bookForm:', bookForm.value);
    
    if (isEditing.value && bookForm.value._id) {
      await api.updateBook(bookForm.value._id, bookForm.value);
      alert('Cập nhật sách thành công!');
    } else {
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const newBook = {
        ...bookForm.value,
        MASACH: `BOOK${randomNum}`,
        NHAXUATBAN: bookForm.value.NHAXUATBAN,
        DONGIA: Number(bookForm.value.DONGIA)
      };
      
      await api.createBook(newBook);
      alert('Thêm sách mới thành công!');
    }
    await refreshBooks();
    bookModal.value.hide();
  } catch (error) {
    console.error('Error submitting book:', error);
    alert(error.message || 'Có lỗi xảy ra khi lưu sách!');
  }
}

// Delete handler
async function handleDelete(bookId) {
  if (confirm('Bạn có chắc muốn xóa sách này?')) {
    try {
      await api.deleteBook(bookId);
      alert('Xóa sách thành công!');
      await refreshBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa sách!');
    }
  }
}

// Computed
const filteredBooks = computed(() => {
  return books.value.filter(book => {
    return (
      book.TENSACH.toLowerCase().includes(searchQuery.value.toLowerCase()) &&
      (categoryFilter.value === '' || book.THELOAI === categoryFilter.value)
    );
  });
});

// Methods
const openAddModal = () => {
  isEditing.value = false;
  bookForm.value = {
    TENSACH: '',
    THELOAI: categories.value[0]?._id || '',
    TACGIA: '',
    NHAXUATBAN: publishers.value[0]?._id || '',
    NAMXUATBAN: new Date().getFullYear(),
    SOQUYEN: 1,
    DONGIA: 0,
    HINHANH: '',
    MOTA: ''
  };
  bookModal.value.show();
};

const openEditModal = (book) => {
  isEditing.value = true;
  bookForm.value = {
    _id: book._id,
    TENSACH: book.TENSACH,
    THELOAI: book.THELOAI,
    TACGIA: book.TACGIA,
    NHAXUATBAN: book.NHAXUATBAN,
    NAMXUATBAN: book.NAMXUATBAN,
    SOQUYEN: book.SOQUYEN,
    DONGIA: book.DONGIA,
    HINHANH: book.HINHANH,
    MOTA: book.MOTA
  };
  bookModal.value.show();
};

const getCategoryName = (id) => {
  const category = categories.value.find(category => category._id === id);
  return category ? category.TENTHELOAI : '';
};

const getPublisherName = (id) => {
  const publisher = publishers.value.find(publisher => publisher._id === id);
  return publisher ? publisher.TENNXB : '';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150';
};
</script>

<style scoped>
.book-management {
  padding: 20px;
}

.book-thumbnail {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 4px;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
}

.btn i {
  margin-right: 4px;
}

.filters {
  max-width: 600px;
}

.form-select, .form-control {
  min-width: 200px;
}

.modal-lg {
  max-width: 800px;
}

.modal-body {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}
</style> 