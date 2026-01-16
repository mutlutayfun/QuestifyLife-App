import { useState } from 'react';
import api from '../api/axiosConfig';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Backend string bekliyor, string'i JSON formatında gönderiyoruz
            // "email@domain.com" şeklinde tırnaklı string olarak gitmesi için JSON.stringify
            const res = await api.post('/Auth/forgot-password', JSON.stringify(email), {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (res.data.success) {
                toast.success("Sıfırlama kodu oluşturuldu! (Test: Konsolu kontrol et)");
                
                // TEST İÇİN: Token'ı konsola yazdırıyoruz. 
                // Gerçek hayatta kullanıcı mailine bakar.
                console.log("TEST TOKEN:", res.data.data); 

                // Kullanıcıyı reset sayfasına yönlendiriyoruz
                // Test kolaylığı için token'ı URL'e ekliyoruz
                navigate(`/reset-password?token=${res.data.data}`); 
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "İstek başarısız.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Şifremi Unuttum 🔑</h1>
                    <p className="text-sm text-gray-500 mt-2">Kayıtlı e-posta adresini gir, sana sıfırlama kodu gönderelim.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="ornek@mail.com"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link to="/login" className="text-gray-500 hover:text-primary font-bold">
                        ← Giriş Ekranına Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}