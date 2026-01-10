import axios from 'axios';

// Backend adresimiz (Localhost portun farklıysa burayı düzelt!)
// Visual Studio'da API projesini çalıştırdığında açılan adres (https://localhost:7090 gibi)
const BASE_URL = 'https://localhost:7090/api'; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// HER İSTEKTEN ÖNCE ÇALIŞACAK KOD (Interceptor)
// Eğer localStorage'da token varsa, onu otomatik ekle.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
