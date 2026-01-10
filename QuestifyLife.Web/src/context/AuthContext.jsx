import { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

// 1. Context'i oluştur
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Uygulama ilk açıldığında localStorage'da token var mı diye bak
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                setUser({ token: token }); 
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // HATA AYIKLAMA FONKSİYONU (Backend hatalarını okur)
    const parseError = (error) => {
        if (error.response) {
            // Backend cevap verdiyse
            const data = error.response.data;

            // 1. FluentValidation Hataları (errors: { Key: [Values] })
            if (data.errors) {
                // Hataları alt alta okunabilir bir metne çevir
                return Object.values(data.errors).flat().join(" ");
            }
            
            // 2. Genel Hata Mesajı (message: "...")
            if (data.message) {
                return data.message;
            }
            
            // 3. Detaylı Hata (detailed: "...")
            if (data.detailed) {
                return data.detailed;
            }
        }
        
        // Sunucu hiç cevap vermediyse
        return "Sunucu ile bağlantı kurulamadı veya beklenmeyen bir hata oluştu.";
    };

    // Giriş Fonksiyonu
    const login = async (email, password) => {
        try {
            const response = await api.post("/Auth/login", { email, password });
            
            const { token, user } = response.data;
            localStorage.setItem("token", token);
            setUser({ token, ...user });
            
            return { success: true };
        } catch (error) {
            console.error("Login hatası:", error);
            return { success: false, message: parseError(error) };
        }
    };

    // Kayıt Fonksiyonu
    const register = async (username, email, password) => {
        try {
            await api.post("/Auth/register", { username, email, password });
            return { success: true };
        } catch (error) {
            console.error("Kayıt hatası:", error);
            return { success: false, message: parseError(error) };
        }
    };

    // Çıkış Fonksiyonu
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};