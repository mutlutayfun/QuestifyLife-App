import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { toast } from 'react-toastify';

const AVATARS = ["avatar_1", "avatar_2", "avatar_3", "avatar_4", "avatar_5"];

export default function Profile() {
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [allBadges, setAllBadges] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    const [selectedBadge, setSelectedBadge] = useState(null);

    const [formData, setFormData] = useState({
        personalManifesto: "",
        dailyTargetPoints: 100,
        weeklyTargetPoints: 500,  // YENİ: Varsayılan değer
        monthlyTargetPoints: 2000, // YENİ: Varsayılan değer
        yearlyTargetPoints: 24000, // YENİ: Varsayılan değer
        avatarId: "avatar_1"
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/User/profile');
            setProfile(response.data);
            
            if(response.data.badges) setAllBadges(response.data.badges); 

            setFormData({
                personalManifesto: response.data.personalManifesto || "",
                dailyTargetPoints: response.data.dailyTargetPoints || 100,
                weeklyTargetPoints: response.data.weeklyTargetPoints || 500, // Backend'den gelmeli
                monthlyTargetPoints: response.data.monthlyTargetPoints || 2000, // Backend'den gelmeli
                yearlyTargetPoints: response.data.yearlyTargetPoints || 24000, // Backend'den gelmeli
                avatarId: response.data.avatarId || "avatar_1"
            });
        } catch (error) {
            console.error(error);
            toast.error("Profil bilgileri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await api.put('/User/profile', formData);
            fetchProfile(); 
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

    const getBadgeIcon = (iconName) => {
        const icons = {
            'star': '⭐', 'scroll': '📜', 'flame': '🔥', 'shield': '🛡️',
            'gem': '💎', 'crown': '👑', 'trophy_bronze': '🥉', 'trophy_silver': '🥈',
            'trophy_gold': '🥇', 'diamond': '💠', 'dagger': '🗡️', 'sword': '⚔️',
            'dragon': '🐉', 'book': '📚', 'dumbbell': '🏋️', 'laptop': '💻',
            'people': '🤝', 'sun': '☀️', 'moon': '🌙', 'coffee': '☕',
            'target': '🎯', 'calendar': '📅', 'rocket': '🚀' // YENİ İKONLAR
        };
        return icons[iconName] || '🏅';
    };

    const getRarityColor = (rarity) => {
        switch(rarity) {
            case 'legendary': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
            case 'epic': return 'border-purple-500 bg-purple-50 text-purple-700';
            case 'rare': return 'border-blue-400 bg-blue-50 text-blue-700';
            default: return 'border-gray-300 bg-gray-50 text-gray-600'; 
        }
    };

    // İlerleme yüzdesi hesaplama
    const calculateProgress = (current, target) => {
        if (!target || target === 0) return 0;
        const percent = (current / target) * 100;
        return Math.min(percent, 100);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="max-w-md mx-auto p-4 pb-24">
                <div className="text-center mb-6 animate-fade-in-up">
                    <div className="w-28 h-28 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-6xl shadow-lg border-4 border-blue-50 relative">
                        {getAvatarEmoji(profile.avatarId)}
                        <div className="absolute -bottom-3 bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-200">
                            Lv. {Math.floor(profile.totalXp / 1000) + 1}
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">{profile.username}</h2>
                    <p className="text-sm text-gray-400 font-medium">{profile.email}</p>
                    
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="text-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-[100px]">
                            <span className="block font-black text-2xl text-primary">{profile.totalXp}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Toplam XP</span>
                        </div>
                        <div className="text-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 min-w-[100px]">
                            <span className="block font-black text-2xl text-orange-500">{profile.currentStreak} 🔥</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Günlük Seri</span>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Rozetler & Hedefler
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Ayarlar
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* HEDEF TAKİBİ KARTI - YENİ */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                                <span>🎯</span> Hedef Takibi
                            </h3>
                            <div className="space-y-4">
                                {/* Haftalık Hedef */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-gray-500">Haftalık Hedef</span>
                                        <span className="text-primary">{profile.pointsEarnedThisWeek || 0} / {formData.weeklyTargetPoints} XP</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-primary h-2.5 rounded-full transition-all duration-1000" 
                                            style={{ width: `${calculateProgress(profile.pointsEarnedThisWeek || 0, formData.weeklyTargetPoints)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Aylık Hedef */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-gray-500">Aylık Hedef</span>
                                        <span className="text-purple-500">{profile.pointsEarnedThisMonth || 0} / {formData.monthlyTargetPoints} XP</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-purple-500 h-2.5 rounded-full transition-all duration-1000" 
                                            style={{ width: `${calculateProgress(profile.pointsEarnedThisMonth || 0, formData.monthlyTargetPoints)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Yıllık Hedef */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-gray-500">Yıllık Hedef</span>
                                        <span className="text-orange-500">{profile.totalXp || 0} / {formData.yearlyTargetPoints} XP</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000" 
                                            style={{ width: `${calculateProgress(profile.totalXp || 0, formData.yearlyTargetPoints)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROZETLER */}
                        <div className="grid grid-cols-4 gap-3">
                            {allBadges.map((badge, index) => (
                                <button 
                                    key={index}
                                    onClick={() => setSelectedBadge(badge)}
                                    className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all active:scale-95 aspect-square justify-center
                                        ${badge.isEarned 
                                            ? `${getRarityColor(badge.rarity)} shadow-sm` 
                                            : 'bg-gray-100 border-gray-200 opacity-60 grayscale'
                                        }
                                    `}
                                >
                                    <span className="text-3xl mb-1 filter drop-shadow-sm">
                                        {getBadgeIcon(badge.iconName)}
                                    </span>
                                    {!badge.isEarned && (
                                        <div className="absolute top-1 right-1 text-[10px] opacity-50">🔒</div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Manifesto Kartı */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <p className="text-[10px] font-black opacity-60 uppercase mb-3 tracking-widest">KENDİME SÖZÜM</p>
                            <p className="text-xl font-bold italic leading-relaxed">"{profile.personalManifesto || 'Henüz bir söz vermedin...'}"</p>
                            <div className="mt-4 flex items-center gap-2 opacity-50">
                                <span className="text-xs">📜</span>
                                <span className="text-[10px] uppercase font-bold">Questify Manifestosu</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3">Hedef Ayarları</h3>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Günlük (XP)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-primary focus:bg-white focus:outline-none font-bold text-gray-700"
                                            value={formData.dailyTargetPoints}
                                            onChange={(e) => setFormData({...formData, dailyTargetPoints: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Haftalık (XP)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-primary focus:bg-white focus:outline-none font-bold text-gray-700"
                                            value={formData.weeklyTargetPoints}
                                            onChange={(e) => setFormData({...formData, weeklyTargetPoints: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Aylık (XP)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-purple-500 focus:bg-white focus:outline-none font-bold text-gray-700"
                                            value={formData.monthlyTargetPoints}
                                            onChange={(e) => setFormData({...formData, monthlyTargetPoints: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Yıllık (XP)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-orange-500 focus:bg-white focus:outline-none font-bold text-gray-700"
                                            value={formData.yearlyTargetPoints}
                                            onChange={(e) => setFormData({...formData, yearlyTargetPoints: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3">Profil Detayları</h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Avatarını Seç</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {AVATARS.map(avatar => (
                                            <button
                                                key={avatar}
                                                onClick={() => setFormData({...formData, avatarId: avatar})}
                                                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all flex-shrink-0
                                                    ${formData.avatarId === avatar ? 'border-primary bg-blue-50 scale-110 shadow-md ring-2 ring-primary ring-opacity-20' : 'border-gray-100 bg-gray-50 grayscale hover:grayscale-0'}`}
                                            >
                                                {getAvatarEmoji(avatar)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Manifesto</label>
                                    <textarea 
                                        className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 focus:border-primary focus:bg-white focus:outline-none text-sm h-24 resize-none transition-all"
                                        value={formData.personalManifesto}
                                        onChange={(e) => setFormData({...formData, personalManifesto: e.target.value})}
                                        placeholder="Kendine bir söz ver..."
                                    />
                                </div>

                                <button 
                                    onClick={handleSaveProfile}
                                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-200 active:scale-95"
                                >
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3">Güvenlik</h3>
                            <ChangePasswordForm />
                        </div>

                        <button 
                            onClick={logout}
                            className="w-full py-3.5 text-red-500 font-bold bg-red-50 rounded-xl hover:bg-red-100 transition border border-red-100 mb-8"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                )}
            </div>

            {selectedBadge && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedBadge(null)}
                >
                    <div 
                        className="bg-white rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl animate-scale-in relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`absolute top-0 left-0 w-full h-24 opacity-20 ${selectedBadge.isEarned ? 'bg-gradient-to-b from-yellow-300 to-transparent' : 'bg-gray-200'}`}></div>

                        <div className="relative z-10">
                            <div className="text-6xl mb-4 filter drop-shadow-md animate-bounce-slow">
                                {getBadgeIcon(selectedBadge.iconName)}
                            </div>
                            
                            <h3 className="text-xl font-black text-gray-800 mb-1">{selectedBadge.name}</h3>
                            
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border ${getRarityColor(selectedBadge.rarity)}`}>
                                {selectedBadge.rarity === 'common' ? 'Yaygın' : 
                                 selectedBadge.rarity === 'rare' ? 'Nadir' : 
                                 selectedBadge.rarity === 'epic' ? 'Destansı' : 'Efsanevi'}
                            </span>

                            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                {selectedBadge.description}
                            </p>

                            <div className={`p-3 rounded-xl border-2 font-bold text-sm
                                ${selectedBadge.isEarned 
                                    ? 'bg-green-50 border-green-200 text-green-700' 
                                    : 'bg-gray-50 border-gray-100 text-gray-400'}
                            `}>
                                {selectedBadge.isEarned 
                                    ? `🏆 KAZANILDI` 
                                    : '🔒 KİLİTLİ'}
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedBadge(null)}
                            className="mt-6 text-gray-400 hover:text-gray-600 font-bold text-sm"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
}