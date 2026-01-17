import axios from "axios";

// BURASI ÇOK ÖNEMLİ:
// Vercel ayarı varsa onu kullan, yoksa direkt senin CANLI BACKEND adresini kullan.
// Böylece ayar yapmayı unutsan bile çalışır.
const baseURL = import.meta.env.VITE_API_URL || "https://questifylife.runasp.net/api";

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