import { createRouter, createWebHistory } from "vue-router";
import Login from './../views/LoginPage.vue';
import Stocks from './../views/StocksPage.vue';
import BulkStockEntry from "@/views/BulkStockEntry.vue";
import { useStore } from "vuex";


const routes = [
    {
        path: "/",
        name: "Login",
        component: Login,
        meta: { guest: true },
    },
    {
        path: "/stocks",
        name: "Stocks",
        component: Stocks,
        requiresAuth: true,
    },
    {
        path: "/bulk-create",
        name: "BulkCreate",
        component: BulkStockEntry,
        requiresAuth: true,

    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const store = useStore();
    const token = store.state.auth.token; // Check for token in Vuex store

    if (to.name !== 'Login' && !token) {
        next({ name: 'Login' }); // Redirect to Login page
    } else {
        next(); // Allow navigation to the route
    }
});


export default router;
