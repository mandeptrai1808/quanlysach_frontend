/**
 * Helper function to fetch data with error handling
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Additional fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
import { eventBus, userState } from '@/eventBus';

async function efetch(url, options = {}) {
  let result = {};
  let json = {};
  try {
    result = await fetch(url, options);
    json = await result.json();
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }

  if (!result.ok) {
    throw new Error(json.message || 'Error fetching data');
  }

  return json.data;
}

/**
 * API Service to interact with the backend
 */
function makeApiService() {
  const baseUrl = 'http://localhost:3000/api'; // Đảm bảo URL này khớp với backend của bạn

  /**
   * Login user and get a token
   * @param {Object} credentials - User credentials (MADOCGIA and MATKHAU)
   * @returns {Promise<any>} - Login response with token
   */
  async function login(credentials) {
    const response = await fetch(`${baseUrl}/member/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const data = await response.json();
    return data; // Trả về object chứa accessToken
  }

  /**
   * Register a new user
   * @param {Object} user - New user data (username, email, password)
   * @returns {Promise<any>} - Registration response
   */
  async function register(user) {
    const url = `${baseUrl}/auth/register`;
    return efetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
  }

  /**
   * Get information about the logged-in user
   * @param {string} token - Authorization token
   * @returns {Promise<any>} - User information
   */
  async function getUserInfo(token) {
    const url = `${baseUrl}/auth/me`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy thông tin người dùng');
    }

    return response.json();
  }

  /**
   * Logout the user
   * @returns {Promise<void>}
   */
  async function logout() {
    localStorage.removeItem('token'); // Remove token from localStorage
    localStorage.removeItem('user'); // Remove user info from localStorage
    console.log('User logged out');
  }

  /**
   * Update user information (Admin only)
   * @param {string} userId - ID of the user to update
   * @param {Object} updatedData - Updated user data (username, email, role, etc.)
   * @param {string} token - Authorization token
   * @returns {Promise<any>} - Updated user information
   */
  async function updateUser(userId, updatedData, token) {
    const url = `${baseUrl}/auth/admin/users/${userId}`;
    return efetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });
  }

  /**
 * Update a user by ID (Admin only)
 * @param {string} userId - ID of the user to update
 * @param {Object} updatedData - Updated user data
 * @param {string} token - Authorization token
 * @returns {Promise<any>} - Updated user information
 */
async function updateUserById(userId, updatedData, token) {
  const url = `${baseUrl}/auth/admin/usersbyid/${userId}`;
  return efetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });
}


  /**
   * Get a list of all users (Admin only)
   * @param {string} token - Authorization token
   * @returns {Promise<any>} - List of users
   */
  async function getAllUsers(token) {
    const url = `${baseUrl}/auth/admin/users`;
    const data = await efetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return data
  }

  /**
   * Delete a user by ID (Admin only)
   * @param {string} userId - ID of the user to delete
   * @param {string} token - Authorization token
   * @returns {Promise<any>} - Delete confirmation
   */
  async function deleteUser(userId, token) {
    const url = `${baseUrl}/auth/admin/users/${userId}`;
    return efetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  /**
   * Fetch all tasks
   * @returns {Promise<any>} - List of tasks
   */
  async function getTasks() {
    const url = `${baseUrl}/tasks`;
    console.log("task url:",url)
    const tasks = await efetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    console.log('Tasks fetched from API:', tasks); // Debug dữ liệu
    return tasks; // ảm bảo trả về dữ liệu
  }

  /**
 * Fetch tasks for the currently logged-in user
 * @returns {Promise<any>} - List of tasks for the current user
 */
async function getUserTasks() {
  const url = `${baseUrl}/tasks/my-tasks`; // API endpoint lấy task của user
  return efetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`, // Đính kèm token để xác thực
    },
  });
}

  /**
   * Create a new task
   * @param {Object} task - Task data
   * @returns {Promise<any>} - Created task
   */
  async function createTask(task) {
    console.log(task)
    const url = `${baseUrl}/tasks`;
    await efetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(task),
    });
    window.location.reload()
    
  }

  /**
   * Update a task by ID
   * @param {string} taskId - ID of the task to update
   * @param {Object} updatedTask - Updated task data
   * @returns {Promise<any>} - Updated task
   */
  async function updateTask(taskId, updatedTask) {
    const url = `${baseUrl}/tasks/${taskId}`;
    return efetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updatedTask),
    });
  }

  /**
   * Delete a task by ID
   * @param {string} taskId - ID of the task to delete
   * @returns {Promise<any>} - Delete confirmation
   */
  async function deleteTask(taskId) {
    const url = `${baseUrl}/tasks/${taskId}`;
    return efetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  /**
   * Lấy danh sách tất cả sách
   * @returns {Promise<Array>} Danh sách sách
   */
  async function getBooks() {
    const url = `${baseUrl}/book`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy danh sách sách');
    }

    return response.json();
  }

  /**
   * Tạo phiếu mượn sách mới
   * @param {Object} loanData - Thông tin phiếu mượn
   * @returns {Promise<Object>} Phiếu mượn đã tạo
   */
  async function createLoanRecord(loanData) {
    const url = `${baseUrl}/loanrecord`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(loanData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo phiếu mượn');
    }

    return response.json();
  }

  /**
   * Lấy danh sách phiếu mượn của người dùng
   * @param {string} userId - ID của người dùng
   * @returns {Promise<Array>} Danh sách phiếu mượn
   */
  async function getUserLoanRecords(userId) {
    const url = `${baseUrl}/loanrecord/${userId}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy danh sách phiếu mượn');
    }

    return response.json();
  }

  async function getCategories() {
    const url = `${baseUrl}/category`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy danh sách thể loại');
    }

    return response.json();
  }

  // Cập nhật method để update trạng thái phiếu mượn
  async function updateLoanRecord(recordId, status) {
    const url = `${baseUrl}/loanrecord`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        _id: recordId,
        TRANGTHAI: status
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update loan record');
    }

    return response.json();
  }

  // Update member information
  async function updateMember(memberId, updateData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${baseUrl}/member/${memberId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error('Failed to update member information');
    }

    return response.json();
  }

  // Register new member
  async function registerMember(memberData) {
    const response = await fetch(`${baseUrl}/member/reg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  // Librarian (Admin) login
  async function loginLibrarian(credentials) {
    const response = await fetch(`${baseUrl}/librarian`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        MSNV: credentials.MSNV,
        MATKHAU: credentials.MATKHAU
      })
    });
    console.log(credentials)
    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  // Get current librarian info
  async function getLibrarianInfo() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${baseUrl}/librarian`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch librarian info');
    }

    return response.json();
  }

  // Lấy danh sách tất cả sách
  async function getAllBooks() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${baseUrl}/book`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  // Lấy danh sách tất cả độc giả
  async function getAllMember() {
    const url = `${baseUrl}/member/all`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy danh sách độc giả');
    }

    return response.json();
  }

  // Lấy danh sách tất cả phiếu mượn
  async function getAllBorrows() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${baseUrl}/loanrecord`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  }

  // Trả sách
  async function returnBook(borrowId) {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${baseUrl}/borrows/${borrowId}/return`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to return book');
    }

    return response.json();
  }

  async function getAllPublishers() {
    const url = `${baseUrl}/publisher`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy danh sách nhà xuất bản');
    }

    return response.json();
  }

  async function createBook(bookData) {
    const url = `${baseUrl}/book`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        MASACH: bookData.MASACH,
        TENSACH: bookData.TENSACH,
        TACGIA: bookData.TACGIA,
        THELOAI: bookData.THELOAI,    // Map từ MATHELOAI
        NHAXUATBAN: bookData.NHAXUATBAN,     // Map từ NHAXUATBAN sang NXB
        NAMXUATBAN: bookData.NAMXUATBAN,
        SOQUYEN: bookData.SOQUYEN,
        DONGIA: bookData.DONGIA,      // Map DONGIA sang GIABIA
        HINHANH: bookData.HINHANH
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo sách mới');
    }

    return response.json();
  }

  async function deleteBook(bookId) {
    const url = `${baseUrl}/book/${bookId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa sách');
    }

    return response.json();
  }

  async function updateBook(bookId, bookData) {
    const url = `${baseUrl}/book/${bookId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        TENSACH: bookData.TENSACH,
        THELOAI: bookData.THELOAI,
        TACGIA: bookData.TACGIA,
        NHAXUATBAN: bookData.NHAXUATBAN,
        NAMXUATBAN: bookData.NAMXUATBAN,
        SOQUYEN: bookData.SOQUYEN,
        DONGIA: bookData.DONGIA,
        HINHANH: bookData.HINHANH,
        MOTA: bookData.MOTA,
        _id: bookData._id
      })
    });
    console.log(bookData)
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật sách');
    }

    return response.json();
  }

  async function deleteMember(memberId) {
    const url = `${baseUrl}/member/${memberId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa độc giả');
    }

    return response.json();
  }

  return {
    login,
    register,
    getUserInfo,
    logout,
    updateUser,
    getAllUsers,
    deleteUser,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getUserTasks,
    updateUserById,
    getBooks,
    createLoanRecord,
    getUserLoanRecords,
    getCategories,
    updateLoanRecord,
    updateMember,
    registerMember,
    loginLibrarian,
    getLibrarianInfo,
    getAllBooks,
    getAllMember,
    getAllBorrows,
    returnBook,
    getAllPublishers,
    createBook,
    deleteBook,
    updateBook,
    deleteMember
  };
}

export default makeApiService();
