import axios from "axios";

// EĞİTİM KÖŞESİ:
// import.meta.env.VITE_API_URL: Vite, .env.development dosyasındaki değeri buraya getirir.
// Eğer bir sebeple bu değer okunamazsa, || operatörü ile güvenli liman olan localhost'a düşeriz.
const baseURL = import.meta.env.VITE_API_URL || "https://localhost:7090/api";

console.log("Mevcut API Adresi:", baseURL); // Konsolda hangi adrese gittiğimizi görmek için log ekledik.

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true, // CORS politikaları ve Cookie/Session işlemleri için kritik.
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Her isteğe Token ekle
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

// Response Interceptor: Hata Yönetimi
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Eğer sunucu 401 (Yetkisiz) hatası dönerse
        if (error.response && error.response.status === 401) {
            // Login veya Ana sayfada değilsek, kullanıcıyı dışarı at
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && currentPath !== "/" && currentPath !== "/register") {
                console.warn("Oturum süresi doldu, çıkış yapılıyor...");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                // Kullanıcı deneyimi için direkt sayfayı yenilemek yerine, 
                // Router ile yönlendirmek daha iyidir ama şimdilik bu güvenli bir önlemdir.
                window.location.href = "/login"; 
            }
        }
        return Promise.reject(error);
    }
);

export default api;