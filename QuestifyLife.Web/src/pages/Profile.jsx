import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { toast } from 'react-toastify';

// Avatar Haritası
const AVATAR_MAP = {
    // Mevcut Tilki Seti
    'avatar_1': '/Characters/Happy_Fox_BF.png',
    'avatar_2': '/Characters/Run_Fox_BF.png',
    'avatar_3': '/Characters/Happy_Fox2_BF.png',
    'avatar_4': '/Characters/Asci_BF.png',
    'avatar_5': '/Characters/BuyucuE_BF.png',
    'avatar_6': '/Characters/BuyucuH_BF.png',
    'avatar_7': '/Characters/DoktorE_BF.png',
    'avatar_8': '/Characters/DoktorH_BF.png',
    'avatar_9': '/Characters/GezginE_BF.png',
    'avatar_10': '/Characters/GirlFriend_BF.png',
    'avatar_11': '/Characters/HappyWaiting.png',
    'avatar_12': '/Characters/King_BF.png',
    'avatar_13': '/Characters/RockciE_BF.png',
    'avatar_14': '/Characters/RockciH_BF.png',
    'avatar_15': '/Characters/Shiny_BF.png',
    'avatar_16': '/Characters/SuperE_BF.png',
    'avatar_17': '/Characters/SuperH_BF.png'
};

const AVATAR_KEYS = Object.keys(AVATAR_MAP);

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
        weeklyTargetPoints: 500,  
        monthlyTargetPoints: 2000, 
        yearlyTargetPoints: 10000, // Varsayılan Ana Hedef
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
                weeklyTargetPoints: response.data.weeklyTargetPoints || 500, 
                monthlyTargetPoints: response.data.monthlyTargetPoints || 2000, 
                yearlyTargetPoints: response.data.yearlyTargetPoints || 10000, 
                avatarId: response.data.avatarId || "avatar_1"
            });
        } catch (error) {
            console.error(error);
            toast.error("Profil alınamadı.");
        } finally {
            setLoading(false);
        }
    };
    

    const handleSaveProfile = async () => {
        try {
            await api.put('/User/profile', formData);
            fetchProfile(); 
            toast.success("Profil güncellendi! ✅");
        } catch (error) {
            console.error(error);
            toast.error("Güncelleme başarısız.");
        }
    };

    const getBadgeIcon = (iconName) => {
        const icons = {
            'star': '⭐', 'scroll': '📜', 'flame': '🔥', 'shield': '🛡️',
            'gem': '💎', 'crown': '👑', 'trophy_bronze': '🥉', 'trophy_silver': '🥈',
            'trophy_gold': '🥇', 'diamond': '💠', 'dagger': '🗡️', 'sword': '⚔️',
            'dragon': '🐉', 'book': '📚', 'dumbbell': '🏋️', 'laptop': '💻',
            'people': '🤝', 'sun': '☀️', 'moon': '🌙', 'coffee': '☕',
            'target': '🎯', 'calendar': '📅', 'rocket': '🚀'
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

    const calculateProgress = (current, target) => {
        if (!target || target === 0) return 0;
        const percent = (current / target) * 100;
        return Math.min(percent, 100);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="max-w-md mx-auto pb-24">
                {/* YENİ HEADER TASARIMI */}
                <div className="relative mb-16">
                    <div className="h-44 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-b-[3rem] shadow-xl overflow-hidden relative">
                         <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-10 -translate-y-10 blur-2xl"></div>
                         <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-10 translate-y-10 blur-2xl"></div>
                         
                         {/* Dekoratif Çizgiler */}
                         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    </div>

                    {/* Avatar Container - Header üzerine biniyor */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 flex flex-col items-center">
                        <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center border-[6px] border-white shadow-2xl z-10 overflow-hidden ring-4 ring-indigo-100 relative group cursor-pointer" onClick={() => setActiveTab('settings')}>
                             <img
                                src={AVATAR_MAP[profile.avatarId] || AVATAR_MAP['avatar_1']}
                                alt="Avatar"
                                className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { e.target.src = '/Characters/Happy_Fox_BF.png'; }}
                            />
                        </div>
                         <div className="absolute -bottom-4 bg-gradient-to-r from-amber-400 to-orange-600 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg border-2 border-white z-20 uppercase tracking-wider whitespace-nowrap transform group-hover:scale-105 transition-transform">
                            LVL {Math.floor(profile.totalXp / 1000) + 1}
                        </div>
                    </div>
                </div>

                <div className="px-5 mt-16 text-center animate-fade-in-up">
                    <br />
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight leading-none mb-1">{profile.username}</h2>
                    <p className="text-sm text-gray-400 font-bold tracking-wide mb-6">{profile.email}</p>
                    

                    {/* İstatistik Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-3xl border border-indigo-100 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                             <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-200 rounded-full -mr-6 -mt-6 opacity-20"></div>
                             <span className="text-3xl font-black text-indigo-600">{profile.totalXp}</span>
                             <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1">Toplam XP</span>
                        </div>
                         <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-3xl border border-orange-100 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                             <div className="absolute top-0 right-0 w-12 h-12 bg-orange-200 rounded-full -mr-6 -mt-6 opacity-20"></div>
                             <span className="text-3xl font-black text-orange-500">{profile.currentStreak} 🔥</span>
                             <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-1">Günlük Seri</span>
                        </div>
                    </div>

                    {/* XP Progress Bar - Daha Büyük ve Şık */}
                     <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
                        <div className="flex justify-between text-xs font-bold mb-2 text-gray-400 uppercase tracking-wide">
                            <span>Mevcut İlerleme</span>
                            <span className="text-indigo-500">{formData.yearlyTargetPoints} XP Hedef</span>
                        </div>
                         <div className="w-full bg-gray-100 rounded-full h-7 shadow-inner relative overflow-hidden ring-1 ring-gray-200">
                            <div
                                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-1000 flex items-center justify-end relative"
                                style={{ width: `${calculateProgress(profile.totalXp, formData.yearlyTargetPoints)}%` }}
                            >
                                <div className="w-full h-full absolute top-0 left-0 bg-white opacity-10 animate-pulse"></div>
                                <div className="mr-1 w-1.5 h-full bg-white/30 skew-x-12"></div>
                            </div>
                            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-gray-600 mix-blend-multiply z-10">
                                {Math.round(calculateProgress(profile.totalXp, formData.yearlyTargetPoints))}%
                            </span>
                             <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white mix-blend-overlay z-10">
                                {Math.round(calculateProgress(profile.totalXp, formData.yearlyTargetPoints))}%
                            </span>
                        </div>
                         <p className="text-[10px] text-gray-400 mt-3 font-medium flex items-center justify-center gap-1">
                            🚀 Bir sonraki seviyeye ulaşmak için görevleri tamamla!
                        </p>
                    </div>


                    {/* Manifesto Kartı - Modern */}
                     <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden mb-8 transform transition-transform hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400 opacity-20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                        
                        <p className="text-[10px] font-black opacity-60 uppercase mb-4 tracking-widest relative z-10 flex items-center gap-2">
                             <span className="w-6 h-[2px] bg-white opacity-40 rounded-full"></span>
                            KENDİME SÖZÜM
                        </p>
                        <p className="text-xl font-bold italic leading-relaxed relative z-10 font-serif">"{profile.personalManifesto || 'Henüz bir söz vermedin...'}"</p>
                        <div className="text-5xl absolute -bottom-2 -right-2 opacity-10 rotate-12 grayscale">✍️</div>
                    </div>


                {/* Tab Menüsü */}
                 <div className="flex bg-gray-100/80 p-1.5 rounded-2xl mb-6 relative backdrop-blur-sm">
                    <button onClick={() => setActiveTab('overview')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}>Rozetler 🏆</button>
                    <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}>Ayarlar ⚙️</button>
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-4 gap-3 mb-8">
                            {allBadges.map((badge, index) => (
                                <button 
                                    key={index}
                                    onClick={() => setSelectedBadge(badge)}
                                    className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all active:scale-95 aspect-square justify-center group
                                        ${badge.isEarned 
                                            ? `${getRarityColor(badge.rarity)} shadow-sm hover:shadow-md bg-white` 
                                            : 'bg-gray-50 border-gray-200 opacity-50 grayscale hover:grayscale-0 hover:opacity-80'}
                                    `}
                                >
                                    <span className="text-3xl mb-1 filter drop-shadow-sm transform group-hover:scale-110 transition-transform">{getBadgeIcon(badge.iconName)}</span>
                                    {!badge.isEarned && <div className="absolute top-1 right-1 text-[10px] opacity-50">🔒</div>}
                                </button>
                            ))}
                        </div>
                        <button onClick={logout} className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-2xl hover:bg-red-100 transition border border-red-100 mb-8 active:scale-95">Çıkış Yap</button>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                                <span className="text-lg">🎯</span> Hedef Ayarları
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Yıllık Hedef (XP)</label>
                                    <div className="relative">
                                         <input type="number" className="w-full p-4 pl-4 border-2 border-indigo-100 rounded-2xl bg-indigo-50/50 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-gray-700 text-lg transition-all" value={formData.yearlyTargetPoints} onChange={(e) => setFormData({...formData, yearlyTargetPoints: parseInt(e.target.value)})} />
                                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-300">XP</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 ml-1">Profilindeki ana ilerleme çubuğu bu hedefe göre dolar.</p>
                                </div>
                                <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Günlük Hedef (XP)</label>
                                        <input type="number" className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:border-primary focus:bg-white focus:outline-none font-bold text-gray-700" value={formData.dailyTargetPoints} onChange={(e) => setFormData({...formData, dailyTargetPoints: parseInt(e.target.value)})} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                             <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                                <span className="text-lg">👤</span> Profil Detayları
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Avatarını Seç</label>
                                    <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
                                        {AVATAR_KEYS.map(key => (
                                            <button
                                                key={key}
                                                onClick={() => setFormData({...formData, avatarId: key})}
                                                className={`w-20 h-20 rounded-full flex items-center justify-center border-[3px] transition-all flex-shrink-0 overflow-hidden bg-white snap-center
                                                    ${formData.avatarId === key 
                                                        ? 'border-indigo-500 scale-110 shadow-lg ring-4 ring-indigo-100 z-10' 
                                                        : 'border-gray-100 grayscale hover:grayscale-0 opacity-70 hover:opacity-100 hover:scale-105'}`}
                                            >
                                                <img 
                                                    src={AVATAR_MAP[key]} 
                                                    alt={key} 
                                                    className="w-full h-full object-contain p-1" 
                                                    onError={(e) => { e.target.style.display = 'none'; }} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Manifesto</label>
                                    <textarea className="w-full p-4 border-2 border-gray-100 rounded-2xl bg-gray-50 focus:border-primary focus:bg-white focus:outline-none text-sm h-32 resize-none transition-all leading-relaxed" value={formData.personalManifesto} onChange={(e) => setFormData({...formData, personalManifesto: e.target.value})} placeholder="Kendine bir söz ver..."/>
                                </div>
                                <button onClick={handleSaveProfile} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-indigo-200 transition active:scale-95">Değişiklikleri Kaydet</button>
                            </div>
                        </div>
                         <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                             <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                                <span className="text-lg">🔒</span> Güvenlik
                            </h3>
                            <ChangePasswordForm />
                        </div>
                        
                    </div>
                )}
                </div>
            </div>

            {selectedBadge && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedBadge(null)}>
                    <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-xs text-center shadow-2xl animate-scale-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
                         <div className={`absolute top-0 left-0 w-full h-32 opacity-20 ${selectedBadge.isEarned ? 'bg-gradient-to-b from-yellow-400 to-transparent' : 'bg-gray-200'}`}></div>
                         <div className="relative z-10 mt-4">
                            <div className="text-7xl mb-4 filter drop-shadow-xl animate-bounce-slow transform hover:scale-110 transition-transform cursor-pointer">{getBadgeIcon(selectedBadge.iconName)}</div>
                            <h3 className="text-2xl font-black text-gray-800 mb-1 tracking-tight">{selectedBadge.name}</h3>
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5 border shadow-sm ${getRarityColor(selectedBadge.rarity)}`}>
                                {selectedBadge.rarity === 'common' ? 'Yaygın' : selectedBadge.rarity === 'rare' ? 'Nadir' : selectedBadge.rarity === 'epic' ? 'Destansı' : 'Efsanevi'}
                            </span>
                            <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium px-2">{selectedBadge.description}</p>
                            <div className={`p-4 rounded-2xl border-2 font-black text-sm uppercase tracking-wider ${selectedBadge.isEarned ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                {selectedBadge.isEarned ? `🏆 KAZANILDI` : '🔒 KİLİTLİ'}
                            </div>
                        </div>
                        <button onClick={() => setSelectedBadge(null)} className="mt-6 text-gray-400 hover:text-gray-800 font-bold text-sm transition-colors">Kapat</button>
                    </div>
                </div>
            )}
        </Layout>
    );
}