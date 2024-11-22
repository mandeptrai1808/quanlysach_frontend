<template>
  <div class="admin-page">
    <h1>User Management</h1>

    <!-- Add New User Form -->
    <form @submit.prevent="addUser" class="user-form">
      <input v-model="newUser.username" type="text" placeholder="Username" required />
      <input v-model="newUser.email" type="email" placeholder="Email" required />
      <input v-model="newUser.password" type="password" placeholder="Password" required />
      <select v-model="newUser.role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" class="btn btn-primary">
        <i class="fas fa-user-plus"></i> Add User
      </button>
    </form>

    <!-- User List -->
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td v-if="editingUserId !== user.id">{{ user.username }}</td>
          <td v-else>
            <input v-model="editableUser.username" type="text" />
          </td>
          <td v-if="editingUserId !== user.id">{{ user.email }}</td>
          <td v-else>
            <input v-model="editableUser.email" type="email" />
          </td>
          <td>
            <select v-if="editingUserId === user.id" v-model="editableUser.role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <span v-else>{{ user.role }}</span>
          </td>
          <td class="action-buttons">
            <button @click="startEdit(user)" v-if="editingUserId !== user.id" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="saveEdit(user.id)" v-else title="Save">
              <i class="fas fa-save"></i>
            </button>
            <button @click="cancelEdit" v-if="editingUserId === user.id" title="Cancel">
              <i class="fas fa-times"></i>
            </button>
            <button @click="deleteUser(user.id)" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api'; // Assume API service exists

const users = ref([]); // User list
const newUser = ref({
  username: '',
  email: '',
  password: '',
  role: 'user', // Default role
});
const editableUser = ref({}); // Temporary editable user
const editingUserId = ref(null); // ID of the user being edited

// Fetch user list
async function fetchUsers() {
  try {
    const response = await api.getAllUsers(localStorage.getItem('token'));
    users.value = response;
  } catch (error) {
    console.error('Error fetching users:', error.message);
  }
}

// Add new user
async function addUser() {
  try {
    await api.register(newUser.value, localStorage.getItem('token'));
    fetchUsers(); // Refresh the user list
    newUser.value = { username: '', email: '', password: '', role: 'user' }; // Reset form
  } catch (error) {
    console.error('Error adding user:', error.message);
  }
}

// Start editing a user
function startEdit(user) {
  editingUserId.value = user.id;
  editableUser.value = { ...user }; // Create a copy for editing
}

// Save edited user
async function saveEdit(userId) {
  try {
    await api.updateUserById(userId, editableUser.value, localStorage.getItem('token'));
    fetchUsers();
    editingUserId.value = null; // Exit edit mode
  } catch (error) {
    console.error('Error saving user:', error.message);
  }
}

// Cancel editing
function cancelEdit() {
  editingUserId.value = null; // Exit edit mode
  editableUser.value = {}; // Reset editable user
}

// Delete user
async function deleteUser(userId) {
  try {
    await api.deleteUser(userId, localStorage.getItem('token'));
    fetchUsers(); // Refresh the user list
  } catch (error) {
    console.error('Error deleting user:', error.message);
  }
}

// Load users when the page loads
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.admin-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.user-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.user-form input,
.user-form select,
.user-form button {
  flex: 1 1 calc(25% - 10px);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 0.9rem;
}

.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.user-table th {
  background-color: #f9f9f9;
  font-weight: bold;
}

.action-buttons button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 5px;
}

.action-buttons button:hover i {
  color: #007bff;
}

button i {
  font-size: 1rem;
  color: rgb(163, 135, 226);
}


button:hover {
  /* transform: scale(1.5); */
}

</style>
