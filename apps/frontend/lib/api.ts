import axios from 'axios';
import { HTTP_BACKEND } from '@/config';

// Create a shared axios instance with default config
const api = axios.create({
    baseURL: HTTP_BACKEND,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };