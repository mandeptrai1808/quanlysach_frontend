import { createWebHistory, createRouter } from 'vue-router';
import Login from '@/views/Login.vue'; // Trang Login
import Home from '@/views/Home.vue';
import BorrowedBooks from '@/views/BorrowedBooks.vue';
import LoginAdmin from '@/views/admin/LoginAdmin.vue';
import AdminLayout from '@/views/admin/Layout.vue';
import AdminDashboard from '@/views/admin/Dashboard.vue';
import BorrowManagement from '@/views/admin/BorrowManagement.vue';
import BookManagement from '@/views/admin/BookManagement.vue';
import UserManagement from '@/views/admin/UserManagement.vue';

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'home',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/borrowed-books',
        name: 'borrowed-books',
        component: BorrowedBooks,
        meta: { requiresAuth: true }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/Register.vue'), // Trang Đăng ký
    },
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: '',
                name: 'admin-login',
                component: LoginAdmin,
                beforeEnter: (to, from, next) => {
                    const adminToken = localStorage.getItem('adminToken');
                    const isAdminLogin = localStorage.getItem('isAdminLogin');
                    
                    if (adminToken && isAdminLogin === 'true') {
                        next('/admin/dashboard');
                    } else {
                        next();
                    }
                }
            },
            {
                path: 'dashboard',
                name: 'admin-dashboard',
                component: AdminDashboard,
                beforeEnter: (to, from, next) => {
                    const adminToken = localStorage.getItem('adminToken');
                    const isAdminLogin = localStorage.getItem('isAdminLogin');
                    
                    if (!adminToken || isAdminLogin !== 'true') {
                        next('/admin');
                    } else {
                        next();
                    }
                }
            },
            {
                path: 'borrows',
                name: 'BorrowManagement',
                component: BorrowManagement,
                meta: { requiresAdmin: true }
            },
            {
                path: 'books',
                name: 'BookManagement',
                component: BookManagement,
                meta: { requiresAdmin: true }
            },
            {
                path: 'users',
                name: 'UserManagement',
                component: UserManagement,
                meta: { requiresAdmin: true }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        component: () => import('@/views/NotFound.vue'), // Trang không tìm thấy
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/Profile.vue'),
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('@/views/AboutUs.vue'), // Thêm đường dẫn tới AboutUs.vue
      }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

// Middleware kiểm tra xác thực
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token'); // Kiểm tra token
    const isAdminLoggedIn = localStorage.getItem('isAdminLogin') === 'true';
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    // Các route không yêu cầu xác thực
    const publicPages = ['login', 'register', 'notfound'];
    
    if (!publicPages.includes(to.name) && !isAuthenticated) {
        next('/'); // Chuyển hướng về login nếu chưa đăng nhập
    } else {
        if (requiresAdmin) {
            if (!isAdminLoggedIn) {
                next({ name: 'admin' }); // Chuyển về trang đăng nhập admin
            } else {
                next(); // Cho phép truy cập
            }
        } else if (to.name === 'admin' && isAdminLoggedIn) {
            next({ name: 'admin-dashboard' }); // Chuyển về dashboard
        } else {
            next(); // Các route khác được phép truy cập bình thường
        }
    }
});

export default router;
