/**
 * API client with Axios and JWT token management.
 */
import axios, { InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    const response = await axios.post('/api/auth/refresh', {
                        refresh_token: refreshToken,
                    });

                    const { access_token } = response.data;
                    localStorage.setItem('access_token', access_token);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
