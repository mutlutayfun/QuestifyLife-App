import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

// Avatar Haritası (Güncel Liste)
const AVATAR_MAP = {
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

const getBadgeIcon = (iconName) => {
    const icons = {
        'star': '⭐', 'scroll': '📜', 'flame': '🔥', 'shield': '🛡️',
        'gem': '💎', 'crown': '👑', 'trophy_bronze': '🥉', 'trophy_silver': '🥈',
        'trophy_gold': '🥇', 'diamond': '💠', 'dagger': '🗡️', 'sword': '⚔️',
        'dragon': '🐉', 'book': '📚', 'dumbbell': '🏋️', 'laptop': '💻',
        'people': '🤝', 'target': '🎯', 'calendar': '📅', 'rocket': '🚀'
    };
    return icons[iconName] || '🏅';
};

const UserProfileModal = ({ userId, onClose }) => {
    const [userProfile, setUserProfile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            try {
                const res = await api.get(`/User/public/${userId}`);
                if (res.data.success) {
                    setUserProfile(res.data.data);
                }
            } catch (error) {
                console.error("Kullanıcı detayı alınamadı", error);
                toast.error("Profil yüklenemedi.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleSendFriendRequest = async () => {
        if (isSendingRequest) return;
        setIsSendingRequest(true);
        
        try {
            const res = await api.post(`/Friends/send-request/${userId}`);
            
            if (res.data.isSuccess) {
                toast.success(res.data.message);
            } else {
                toast.info(res.data.message);
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "İstek gönderilemedi.";
            toast.warning(msg);
        } finally {
            setIsSendingRequest(false);
        }
    };

    const getUserLevel = (u) => {
        if (u.level) return u.level;
        return Math.floor((u.totalXp || 0) / 1000) + 1;
    };

    // Katılım Tarihini Formatla (Örn: "Ocak 2024")
    const getJoinDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
    };

    if (!userId) return null;

    const isMe = currentUser?.id && userId && (String(currentUser.id).toLowerCase() === String(userId).toLowerCase());

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-[2rem] w-full max-w-xs overflow-hidden shadow-2xl relative animate-scale-in border-4 border-indigo-50"
                onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh', overflowY: 'auto' }} // Dikey taşmayı engellemek için scroll
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-white bg-black/20 hover:bg-red-500 hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all z-20 backdrop-blur-sm"
                >
                    ✕
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400 font-bold text-sm">Yükleniyor...</span>
                    </div>
                ) : userProfile ? (
                    <>
                        {/* Header Gradient - Daha Cafcaflı */}
                        <div className="h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                             {/* Dekoratif Daireler */}
                             <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-x-10 -translate-y-10 blur-xl"></div>
                             <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-10 translate-y-10 blur-xl"></div>
                        </div>

                        {/* Avatar ve Level Alanı */}
                        <div className="relative flex flex-col items-center -mt-16 mb-2">
                             {/* Avatar Dairesi - BÜYÜTÜLDÜ */}
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-[6px] border-white shadow-2xl z-10 overflow-hidden ring-4 ring-indigo-100 relative group">
                                <img 
                                    src={AVATAR_MAP[userProfile.avatarId] || AVATAR_MAP['avatar_1']} 
                                    alt="User Avatar"
                                    className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-110" // object-contain ile sığdırma sorunu çözüldü
                                    onError={(e) => { e.target.src = '/Characters/Happy_Fox_BF.png'; }}
                                />
                            </div>
                            
                            {/* Level Badge - Daha Parlak */}
                            <div className="absolute -bottom-3 bg-gradient-to-r from-amber-400 to-orange-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg border-2 border-white z-20 uppercase tracking-wider flex items-center gap-1 transform hover:scale-105 transition-transform cursor-default">
                                <span>⭐ LVL</span>
                                <span className="text-sm">{getUserLevel(userProfile)}</span>
                            </div>
                        </div>

                        {/* Kullanıcı Bilgileri */}
                        <div className="text-center px-5 mt-6">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight leading-tight mb-1">{userProfile.username}</h2>
                            
                            {/* Unvan ve Tarih */}
                            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-80 mb-4">
                                <span>Maceracı Katılma Tarihi</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{getJoinDate(userProfile.joinDate)}</span>
                            </div>
                            
                             {/* İstatistik Kartları */}
                             <div className="flex justify-center gap-3 mb-5">
                                <div className="flex flex-col items-center justify-center py-2 px-4 bg-indigo-50 border border-indigo-100 rounded-2xl min-w-[90px] shadow-sm">
                                    <span className="text-lg font-black text-indigo-600 leading-none">{userProfile.totalXp}</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">XP Puanı</span>
                                </div>
                                <div className="flex flex-col items-center justify-center py-2 px-4 bg-orange-50 border border-orange-100 rounded-2xl min-w-[90px] shadow-sm">
                                    <span className="text-lg font-black text-orange-500 leading-none">{userProfile.currentStreak}🔥</span>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Gün Seri</span>
                                </div>
                             </div>

                            {userProfile.personalManifesto && (
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-indigo-100 text-indigo-900 text-sm italic relative text-center shadow-inner mx-1 leading-relaxed">
                                    <span className="opacity-50 text-indigo-300 text-2xl absolute -top-2 left-2 leading-none">“</span>
                                    {userProfile.personalManifesto}
                                    <span className="opacity-50 text-indigo-300 text-2xl absolute -bottom-4 right-2 leading-none">”</span>
                                </div>
                            )}

                             {/* Arkadaş Ekle Butonu */}
                            {!isMe && (
                                <button 
                                    onClick={handleSendFriendRequest}
                                    disabled={isSendingRequest}
                                    className={`mt-5 w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg
                                        ${isSendingRequest 
                                            ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                            : 'bg-gradient-to-r from-green-400 to-emerald-600 text-white hover:shadow-green-200/50 hover:from-green-500 hover:to-emerald-700 hover:-translate-y-0.5'}`}
                                >
                                    {isSendingRequest ? (
                                        <span className="text-xs">İstek Gönderiliyor...</span>
                                    ) : (
                                        <>
                                            <span className="text-xl">👋</span>
                                            <span className="text-sm">Arkadaş Ekle</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Rozet Vitrini */}
                        <div className="p-5 pb-8">
                            <div className="flex items-center justify-center gap-2 mb-4 opacity-60">
                                <div className="h-[1px] w-8 bg-gray-200"></div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Koleksiyon</h3>
                                <div className="h-[1px] w-8 bg-gray-200"></div>
                            </div>
                            
                            {userProfile.earnedBadges && userProfile.earnedBadges.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-3 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                    {userProfile.earnedBadges.map((badge, idx) => (
                                        <div 
                                            key={idx} 
                                            className="w-12 h-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl flex items-center justify-center text-2xl border border-gray-100 shadow-sm hover:scale-110 hover:shadow-lg transition-all cursor-help relative group z-0 hover:z-10"
                                            title={badge.name}
                                        >
                                            {getBadgeIcon(badge.iconName)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 mx-2">
                                    <span className="text-3xl grayscale opacity-20 block mb-2">🏆</span>
                                    <p className="text-[11px] text-gray-400 font-medium">Henüz kazanılan rozet yok</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-10 text-center text-red-400 text-sm font-bold">Kullanıcı bilgisi alınamadı.</div>
                )}
            </div>
        </div>
    );
};

export default UserProfileModal;