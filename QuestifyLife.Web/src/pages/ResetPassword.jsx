import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // URL'den token'ı al (örn: /reset-password?token=ABC...)
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) setToken(tokenFromUrl);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/Auth/reset-password', {
                token: token,
                newPassword: newPassword
            });

            if (res.data.success) {
                toast.success("Şifreniz başarıyla değiştirildi! 🎉");
                navigate('/login');
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Şifre sıfırlama başarısız.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Yeni Şifre Belirle 🔒</h1>
                    <p className="text-sm text-gray-500 mt-2">Hesabın için güçlü bir şifre seç.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sıfırlama Kodu (Token)</label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                            readOnly 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
}