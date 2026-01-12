import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import ChangePasswordForm from '../components/ChangePasswordForm'; // Yeni bileşen
import { toast } from 'react-toastify';

// Avatar Listesi
const AVATARS = ["avatar_1", "avatar_2", "avatar_3", "avatar_4", "avatar_5"];

export default function Profile() {
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'settings'
    
    // Düzenleme form verileri
    const [formData, setFormData] = useState({
        personalManifesto: "",
        dailyTargetPoints: 100,
        avatarId: "avatar_1"
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/User/profile');
            setProfile(response.data);
            setFormData({
                personalManifesto: response.data.personalManifesto || "",
                dailyTargetPoints: response.data.dailyTargetPoints,
                avatarId: response.data.avatarId || "avatar_1"
            });
        } catch (error) {
            console.error("Profil yüklenemedi", error);
            toast.error("Profil bilgileri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await api.put('/User/profile', formData);
            fetchProfile(); // Güncel veriyi çek
            toast.success("Profilin güncellendi! ✅");
        } catch (error) {
            console.error(error);
            toast.error("Güncelleme başarısız.");
        }
    };

    const getAvatarEmoji = (id) => {
        const map = {
            'avatar_1': '👨‍💻', 'avatar_2': '🦸‍♀️', 
            'avatar_3': '🥷', 'avatar_4': '🧑‍🚀', 'avatar_5': '🧙‍♂️'
        };
        return map[id] || '👤';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="max-w-md mx-auto p-4">
                {/* Üst Kısım: Avatar ve Özet */}
                <div className="text-center mb-6 animate-fade-in-up">
                    <div className="w-28 h-28 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-6xl shadow-lg border-4 border-blue-50">
                        {getAvatarEmoji(profile.avatarId)}
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">{profile.username}</h2>
                    <p className="text-sm text-gray-400 font-medium">{profile.email}</p>
                    
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                            <span className="block font-black text-xl text-primary">{profile.totalXp}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">XP</span>
                        </div>
                        <div className="text-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                            <span className="block font-black text-xl text-secondary">{profile.currentStreak}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Seri</span>
                        </div>
                    </div>
                </div>

                {/* Sekmeler (Tabs) */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Genel Bakış
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Ayarlar
                    </button>
                </div>

                {/* --- SEKME 1: GENEL BAKIŞ --- */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Rozetler */}
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <span>🏆</span> Rozet Koleksiyonu
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {profile.badges && profile.badges.map((badge, index) => (
                                    <div key={index} className={`flex flex-col items-center p-2 rounded-xl border transition-all hover:scale-105 ${badge.isEarned ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}>
                                        <span className="text-2xl mb-1">
                                            {badge.iconName === 'star' ? '⭐' : 
                                             badge.iconName === 'crown' ? '👑' :
                                             badge.iconName === 'fire' ? '🔥' : '🏅'}
                                        </span>
                                        <span className="text-[9px] text-center font-bold text-gray-600 leading-tight">{badge.name}</span>
                                    </div>
                                ))}
                                {(!profile.badges || profile.badges.length === 0) && (
                                    <p className="text-xs text-gray-400 col-span-4 text-center py-4 bg-white rounded-xl border border-dashed border-gray-200">Henüz rozet kazanılmadı.</p>
                                )}
                            </div>
                        </div>

                        {/* Manifesto Kartı */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                            <p className="text-[10px] font-black opacity-60 uppercase mb-2">Kendime Sözüm</p>
                            <p className="text-lg font-bold italic">"{profile.personalManifesto || 'Henüz bir söz vermedin...'}"</p>
                            <div className="absolute -right-4 -bottom-4 text-6xl opacity-20">📜</div>
                        </div>
                    </div>
                )}

                {/* --- SEKME 2: AYARLAR --- */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* 1. Profil Düzenleme */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider border-b pb-2">Profil Düzenle</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Avatarını Seç</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {AVATARS.map(avatar => (
                                            <button
                                                key={avatar}
                                                onClick={() => setFormData({...formData, avatarId: avatar})}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all flex-shrink-0
                                                    ${formData.avatarId === avatar ? 'border-primary bg-blue-50 scale-110 shadow-md' : 'border-gray-100 bg-gray-50'}`}
                                            >
                                                {getAvatarEmoji(avatar)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Günlük Hedef (XP)</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:border-primary focus:outline-none font-bold text-gray-700"
                                        value={formData.dailyTargetPoints}
                                        onChange={(e) => setFormData({...formData, dailyTargetPoints: parseInt(e.target.value)})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Manifesto</label>
                                    <textarea 
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:border-primary focus:outline-none text-sm h-20 resize-none"
                                        value={formData.personalManifesto}
                                        onChange={(e) => setFormData({...formData, personalManifesto: e.target.value})}
                                        placeholder="Kendine bir söz ver..."
                                    />
                                </div>

                                <button 
                                    onClick={handleSaveProfile}
                                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition shadow-lg active:scale-95"
                                >
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </div>

                        {/* 2. Şifre Değiştirme */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider border-b pb-2">Güvenlik</h3>
                            <ChangePasswordForm />
                        </div>

                        {/* 3. Çıkış Yap */}
                        <button 
                            onClick={logout}
                            className="w-full py-3 text-red-500 font-bold bg-red-50 rounded-xl hover:bg-red-100 transition border border-red-100"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
}