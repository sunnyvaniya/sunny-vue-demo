import axiosInstance from "@/axios";
import axios from "axios";

export default {
    namespaced: true,
    state: () => ({
        user: null,
        token: localStorage.getItem("token") || null, // Store token in localStorage (or sessionStorage)
        loading: false,
        error: null,
    }),
    mutations: {
        SET_USER(state, user) {
            state.user = user;
        },
        SET_TOKEN(state, token) {
            state.token = token;
            localStorage.setItem("token", token); // Save token to localStorage
        },
        SET_LOADING(state, status) {
            state.loading = status;
        },
        SET_ERROR(state, error) {
            state.error = error;
        },
        LOGOUT(state) {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token"); // Remove token from localStorage
        },
    },
    actions: {
        // Login action
        async login({ commit }, credentials) {
            commit("SET_LOADING", true);
            commit("SET_ERROR", null);

            try {
                const res = await axios.post("http://127.0.0.1:8000/api/login", credentials);

                // Handle successful login
                if (res.data.token) {
                    commit("SET_TOKEN", res.data.token);
                    commit("SET_USER", res.data.user);
                    return { success: true }; // Return success to the component
                } else {
                    commit("SET_ERROR", "Login failed");
                    return { success: false }; // Return failure to the component
                }
            } catch (err) {
                // Handle error when response is not available
                const errorMessage = err.response?.data?.error || "Login failed";
                commit("SET_ERROR", errorMessage);
                return { success: false, error: errorMessage }; // Return error details to the component
            } finally {
                commit("SET_LOADING", false);
            }
        },

        // Logout action
        async logout({ commit, rootState }) {


            try {
                const token = rootState.auth.token;

                await axiosInstance.post("/logout", {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });                // Handle successful login
                commit("LOGOUT");
                return { success: true }; // Return success to the component

            } catch (err) {
                // Handle error when response is not available
                const errorMessage = err.response?.data?.error || "Logout failed";
                commit("SET_ERROR", errorMessage);
                return { success: false, error: errorMessage }; // Return error details to the component
            } finally {
                commit("SET_LOADING", false);
            }
        },
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user,
    },
};
