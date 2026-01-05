import { createRouter, createWebHistory } from 'vue-router';
import InscricaoForm from '../components/InscricaoForm.vue';
import AdminLogin from '../components/AdminLogin.vue';
import AdminDashboard from '../components/AdminDashboard.vue';

const routes = [
    { path: '/', component: InscricaoForm },
    { path: '/admin', component: AdminLogin },
    { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Simple navigation guard
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const isAuthenticated = localStorage.getItem('adminAuth');
        if (isAuthenticated) {
            next();
        } else {
            next('/admin');
        }
    } else {
        next();
    }
});

export default router;
