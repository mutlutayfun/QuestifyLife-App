import axios from "axios";

// Eğer Vercel'de VITE_API_URL tanımlıysa onu kullan, yoksa localhost'u kullan.
// Senin canlı API adresin: https://questifylife.runasp.net/api
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:7153/api";

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true, // CORS ve Cookie işlemleri için gerekli
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Token varsa her isteğe ekle
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: 401 hatası gelirse (Token süresi dolmuşsa)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Sadece giriş sayfasında değilsek çıkış yap
            if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                // window.location.href = "/login"; // İsteğe bağlı yönlendirme
            }
        }
        return Promise.reject(error);
    }
);

export default api;