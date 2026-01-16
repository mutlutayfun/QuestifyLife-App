import { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

// 1. Context'i oluştur
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Uygulama ilk açıldığında localStorage'da token ve user var mı diye bak
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user"); // YENİ: Kayıtlı kullanıcı verisini de oku

            if (token) {
                // Her istekte token gönderilmesi için header'ı ayarla
                api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                if (storedUser) {
                    // Hem token hem kullanıcı verisi varsa state'e yükle
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser({ token, ...parsedUser });
                    } catch (error) {
                        console.error("Kullanıcı verisi okunamadı:", error);    
                        // JSON hatası olursa sadece token ile devam et
                        setUser({ token });
                    }
                } else {
                    // Sadece token varsa (eski versiyondan kalma)
                    setUser({ token });
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // HATA AYIKLAMA FONKSİYONU (Senin kodun)
    const parseError = (error) => {
        if (error.response) {
            const data = error.response.data;
            if (data.errors) {
                return Object.values(data.errors).flat().join(" ");
            }
            if (data.message) {
                return data.message;
            }
            if (data.detailed) {
                return data.detailed;
            }
        }
        return "Sunucu ile bağlantı kurulamadı veya beklenmeyen bir hata oluştu.";
    };

    // Giriş Fonksiyonu
    const login = async (usernameOrEmail, password) => {
        try {
            const response = await api.post("/Auth/login", { usernameOrEmail, password });
            
            const { token, user } = response.data;
            
            // YENİ: Token ile birlikte User objesini de sakla (Tutorial bilgisi kaybolmasın diye)
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            
            // Header'ı ayarla
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            // State'i güncelle
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
        localStorage.removeItem("user"); // YENİ: User verisini de temizle
        delete api.defaults.headers.common["Authorization"]; // Header'ı temizle
        setUser(null);
    };

    // --- YENİ FONKSİYON: Kullanıcı Bilgisini Güncelle ---
    // Tutorial tamamlandığında, sayfa yenilenmeden state'i güncellemek için kullanılır.
    const updateUser = (newUserData) => {
        if (!user) return;

        // Mevcut user state'i ile yeni veriyi birleştir
        const updatedUser = { ...user, ...newUserData };
        
        // State'i güncelle
        setUser(updatedUser);
        
        // LocalStorage'ı güncelle (ki F5 atınca tutorial tekrar çıkmasın)
        // Token'ı user objesinin içine kaydetmemize gerek yok ama state içinde var.
        // Basitlik için updatedUser'ı kaydediyoruz.
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};