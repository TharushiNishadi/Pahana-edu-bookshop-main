import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:12345';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Product API functions
export const productAPI = {
    getAll: () => apiClient.get('/product'),
    getById: (id) => apiClient.get(`/product/${id}`),
    create: (formData) => apiClient.post('/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => apiClient.put(`/product/${id}`, data),
    delete: (id) => apiClient.delete(`/product/${id}`),
};

// Category API functions
export const categoryAPI = {
    getAll: () => apiClient.get('/category'),
    create: (data) => apiClient.post('/category', data),
    update: (id, data) => apiClient.put(`/category/${id}`, data),
    delete: (id) => apiClient.delete(`/category/${id}`),
};

// Users API functions
export const usersAPI = {
    getAll: () => apiClient.get('/users'),
    getById: (id) => apiClient.get(`/users/${id}`),
    create: (data) => apiClient.post('/users', data),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    delete: (id) => apiClient.delete(`/users/${id}`),
};

// Auth API functions
export const authAPI = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/profile'),
};

// Favorites API functions
export const favoritesAPI = {
    add: (userId, productId) => apiClient.post('/api/favorites/add', { userId, productId }),
    remove: (userId, productId) => apiClient.post('/api/favorites/remove', { userId, productId }),
    getUserFavorites: (userId) => apiClient.get(`/api/favorites/${userId}`),
};

// Legacy functions for backward compatibility
export const addFavoriteProduct = async (userId, productId) => {
    try {
        await apiClient.post('/api/favorites/add', { userId, productId });
    } catch (error) {
        console.error('Error adding favorite product:', error);
        throw error;
    }
};

export const removeFavoriteProduct = async (userId, productId) => {
    try {
        await apiClient.post('/api/favorites/remove', { userId, productId });
    } catch (error) {
        console.error('Error removing favorite product:', error);
        throw error;
    }
};
