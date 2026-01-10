import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator, or environment variable for production
const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const register = async (userData: any) => {
    const response = await api.post('/users/register', userData);
    return response.data;
};

export const login = async (credentials: any) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;
};

export const logout = async () => {
    await AsyncStorage.removeItem('authToken');
};

export default api;
