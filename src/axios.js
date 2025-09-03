import axios from "axios";

// Set up the axios instance with a base URL
const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api", // Your base API URL
});

// Interceptor to add the Bearer token before every request
axiosInstance.interceptors.request.use(
    (config) => {
        // Check if token is passed in request config headers
        if (config.token) {
            config.headers["Authorization"] = `Bearer ${config.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optionally, set up a response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized error (e.g., redirect to login)
            console.error("Unauthorized, please log in.");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
