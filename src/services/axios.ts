import axios from 'axios';

export const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const token = localStorage.getItem('auth_token');
            if (token) {
                // Stored token was rejected (expired/invalid) — clear and force re-login
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
            // No token means this is a login attempt with wrong credentials.
            // Let the error bubble so onError can show a toast.
        }
        return Promise.reject(error);
    }
);