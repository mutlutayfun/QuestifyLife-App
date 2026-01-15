import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext'; // Giriş yapan kullanıcıyı almak için

const getAvatarEmoji = (id) => {
    const map = { 'avatar_1': '👨‍💻', 'avatar_2': '🦸‍♀️', 'avatar_3': '🥷', 'avatar_4': '🧑‍🚀', 'avatar_5': '🧙‍♂️' };
    return map[id] || '👤';
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
    // Backend PublicUserProfileDto dönüyor:
    // { username, avatarId, totalXp, currentStreak, level, personalManifesto, joinDate, earnedBadges }
    const [userProfile, setUserProfile] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [isSendingRequest, setIsSendingRequest] = useState(false);
    
    // Mevcut giriş yapmış kullanıcıyı al
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        if (!userId) return;
        const fetchUser = async () => {
            try {
                // Public profil endpoint'i (Tahmini: /User/public/{id})
                // Backend DTO: PublicUserProfileDto
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

    // ARKADAŞ İSTEĞİ GÖNDERME
    const handleSendFriendRequest = async () => {
        if (isSendingRequest) return;
        setIsSendingRequest(true);
        
        try {
            // Yeni oluşturduğumuz ID tabanlı endpoint: /Friends/send-request/{targetUserId}
            const res = await api.post(`/Friends/send-request/${userId}`);
            
            // Backend cevabı: { message: "...", isSuccess: true/false }
            if (res.data.isSuccess) {
                toast.success(res.data.message);
            } else {
                toast.info(res.data.message);
            }
        } catch (error) {
            console.error(error);
             // Backend 400 dönerse mesajı yakala
            const msg = error.response?.data?.message || "İstek gönderilemedi.";
            toast.warning(msg);
        } finally {
            setIsSendingRequest(false);
        }
    };

    // Level Hesaplama Yardımcısı (DTO'da level varsa onu kullan, yoksa hesapla)
    const getUserLevel = (u) => {
        if (u.level) return u.level;
        return Math.floor((u.totalXp || 0) / 1000) + 1;
    };

    if (!userId) return null;

    // Kendi profilimiz mi?
    // currentUser.id (string) vs userId (guid/string) karşılaştırması
    const isMe = currentUser?.id && userId && (String(currentUser.id).toLowerCase() === String(userId).toLowerCase());

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Kapat Butonu */}
                <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition z-10">✕</button>

                {loading ? (
                    <div className="p-10 text-center text-gray-400">Yükleniyor...</div>
                ) : userProfile ? (
                    <>
                        {/* Üst Header (Arkaplan) */}
                        <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-200 relative">
                            {/* İstatistikler */}
                            <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-end gap-6 px-4">
                                {/* XP KUTUSU */}
                                <div className="text-center bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm min-w-[70px]">
                                    <span className="block text-xl font-black text-indigo-600">{userProfile.totalXp}</span>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">XP</span>
                                </div>

                                {/* ORTA - AVATAR YERİ */}
                                <div className="w-20"></div> 

                                {/* SERİ KUTUSU */}
                                <div className="text-center bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-sm min-w-[70px]">
                                    <span className="block text-xl font-black text-orange-500">{userProfile.currentStreak}🔥</span>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Seri</span>
                                </div>
                            </div>
                        </div>

                        {/* Avatar ve Level */}
                        <div className="relative flex flex-col items-center -mt-16 mb-4">
                            {/* AVATAR */}
                            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-6xl border-4 border-white shadow-lg z-10">
                                {getAvatarEmoji(userProfile.avatarId)}
                            </div>
                            
                            {/* LEVEL BADGE */}
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md border-2 border-white -mt-4 z-20 uppercase tracking-wider">
                                LEVEL {getUserLevel(userProfile)}
                            </div>
                        </div>

                        {/* İsim & Bilgi */}
                        <div className="text-center px-6 mb-6">
                            <h2 className="text-2xl font-black text-gray-800">{userProfile.username}</h2>
                            <p className="text-xs text-gray-400 font-medium">Maceracı • {new Date(userProfile.joinDate).getFullYear()}'den beri üye</p>
                            
                            {userProfile.personalManifesto && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 italic text-blue-800 text-sm relative">
                                    <span className="absolute -top-2 left-2 text-xl">❝</span>
                                    {userProfile.personalManifesto}
                                    <span className="absolute -bottom-4 right-2 text-xl">❞</span>
                                </div>
                            )}

                            {/* ARKADAŞ EKLEME BUTONU */}
                            {!isMe && (
                                <button 
                                    onClick={handleSendFriendRequest}
                                    disabled={isSendingRequest}
                                    className={`mt-4 w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition transform active:scale-95 shadow-md
                                        ${isSendingRequest 
                                            ? 'bg-gray-100 text-gray-400 cursor-wait' 
                                            : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'}`}
                                >
                                    <span>{isSendingRequest ? 'Gönderiliyor...' : 'Arkadaş Ekle'}</span>
                                    {!isSendingRequest && <span>👋</span>}
                                </button>
                            )}
                        </div>

                        {/* Rozet Vitrini (earnedBadges) */}
                        <div className="px-6 pb-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Rozet Koleksiyonu</h3>
                            
                            {userProfile.earnedBadges && userProfile.earnedBadges.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                                    {userProfile.earnedBadges.map((badge, idx) => (
                                        <div 
                                            key={idx} 
                                            className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl border border-gray-100 hover:scale-110 transition shadow-sm"
                                            title={badge.name}
                                        >
                                            {getBadgeIcon(badge.iconName)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-xs text-gray-300 italic">Henüz rozet kazanmamış.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-10 text-center text-red-400">Kullanıcı bilgisi alınamadı.</div>
                )}
            </div>
        </div>
    );
};

export default UserProfileModal;