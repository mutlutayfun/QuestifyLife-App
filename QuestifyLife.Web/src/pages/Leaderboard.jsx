import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import UserProfileModal from '../components/UserProfileModal';
import { toast } from 'react-toastify';

// Avatar Haritası (Profile.jsx ile uyumlu görsel set)
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

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/Performance/leaderboard');
                if (res.data.success) {
                    setUsers(res.data.data);
                }
            } catch (error) {
                console.error("Liderlik tablosu hatası:", error);
                toast.error("Sıralama yüklenirken hata oluştu.");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const handleUserClick = (user) => {
        const userId = user.id || user.Id || user.userId || user.UserId; 
        if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
            setSelectedUserId(userId);
        } else {
            toast.error("Kullanıcı detayları alınamadı.");
        }
    };

    if (loading) return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                     <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-indigo-600 animate-pulse">Efsaneler Yükleniyor...</p>
                </div>
            </div>
        </Layout>
    );

    const topThree = users.slice(0, 3);
    const restOfUsers = users.slice(3);

    return (
        <Layout>
            <div className="max-w-md mx-auto pb-24">
                {/* 🌟 GÖSTERİŞLİ HEADER */}
                <div className="relative mb-8">
                     <div className="h-44 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-b-[2.5rem] shadow-xl overflow-hidden relative flex flex-col items-center justify-start pt-6 text-center">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-10 -translate-y-10 blur-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full translate-x-10 translate-y-10 blur-2xl"></div>
                        
                        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md relative z-10 flex items-center gap-2">
                             <span>🏆</span> Liderlik Tablosu
                        </h1>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">En İyi Maceracılar</p>
                    </div>
                </div>

                {/* 👑 TOP 3 KÜRSÜ ALANI */}
                <div className="flex justify-center items-end gap-2 mb-10 px-2 -mt-24 relative z-10">
                    
                    {/* 🥈 2. SIRA */}
                    {topThree[1] && (
                         <div onClick={() => handleUserClick(topThree[1])} className="flex flex-col items-center cursor-pointer group w-1/3 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-slate-300 bg-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                                    <img 
                                        src={AVATAR_MAP[topThree[1].avatarId] || AVATAR_MAP['avatar_1']} 
                                        className="w-full h-full object-contain p-1" 
                                        onError={(e) => e.target.src = AVATAR_MAP['avatar_1']} 
                                        alt="Avatar"
                                    />
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-slate-300 to-slate-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                    #2
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-slate-700 text-xs truncate w-20 px-1">{topThree[1].username}</p>
                                <p className="font-black text-slate-500 text-[10px]">{topThree[1].totalXp} XP</p>
                            </div>
                        </div>
                    )}

                    {/* 🥇 1. SIRA */}
                    {topThree[0] && (
                        <div onClick={() => handleUserClick(topThree[0])} className="flex flex-col items-center cursor-pointer group w-1/3 -mb-6 animate-fade-in-up z-20">
                            <div className="absolute -top-10 animate-bounce-slow text-5xl filter drop-shadow-lg z-30">👑</div>
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full border-[5px] border-yellow-400 bg-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform ring-4 ring-yellow-100 flex items-center justify-center">
                                     <img 
                                        src={AVATAR_MAP[topThree[0].avatarId] || AVATAR_MAP['avatar_1']} 
                                        className="w-full h-full object-contain p-1.5" 
                                        onError={(e) => e.target.src = AVATAR_MAP['avatar_1']} 
                                        alt="Avatar"
                                    />
                                </div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-b from-yellow-400 to-yellow-500 text-white text-sm font-black px-4 py-0.5 rounded-full border-2 border-white shadow-lg whitespace-nowrap">
                                    #1
                                </div>
                            </div>
                             <div className="mt-5 text-center bg-white/80 backdrop-blur-sm px-2 py-1 rounded-xl shadow-sm border border-yellow-100">
                                <p className="font-black text-gray-800 text-sm truncate w-24">{topThree[0].username}</p>
                                <p className="font-black text-yellow-500 text-xs">{topThree[0].totalXp} XP</p>
                            </div>
                        </div>
                    )}

                    {/* 🥉 3. SIRA */}
                    {topThree[2] && (
                         <div onClick={() => handleUserClick(topThree[2])} className="flex flex-col items-center cursor-pointer group w-1/3 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-orange-300 bg-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform flex items-center justify-center">
                                     <img 
                                        src={AVATAR_MAP[topThree[2].avatarId] || AVATAR_MAP['avatar_1']} 
                                        className="w-full h-full object-contain p-1" 
                                        onError={(e) => e.target.src = AVATAR_MAP['avatar_1']} 
                                        alt="Avatar"
                                    />
                                </div>
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-orange-300 to-orange-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                    #3
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="font-bold text-orange-800 text-xs truncate w-20 px-1">{topThree[2].username}</p>
                                <p className="font-black text-orange-600 text-[10px]">{topThree[2].totalXp} XP</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 📜 LİSTE ALANI (DİĞERLERİ) */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-2 mx-2 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-4 mb-2 mt-2">Diğer Efsaneler</h3>
                    
                    {restOfUsers.map((user, index) => (
                        <div
                            key={user.rank || index + 4}
                            onClick={() => handleUserClick(user)}
                            className={`flex items-center justify-between p-3 mb-2 rounded-2xl transition-all cursor-pointer border group
                                ${user.isCurrentUser 
                                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 shadow-sm' 
                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className={`font-black w-6 text-center text-sm ${user.rank <= 10 ? 'text-gray-600' : 'text-gray-300'}`}>
                                    #{user.rank}
                                </span>
                                
                                <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 relative group-hover:scale-110 transition-transform">
                                     <img 
                                        src={AVATAR_MAP[user.avatarId] || AVATAR_MAP['avatar_1']} 
                                        className="w-full h-full object-contain p-0.5" 
                                        onError={(e) => e.target.src = AVATAR_MAP['avatar_1']} 
                                        alt="Avatar"
                                    />
                                </div>
                                
                                <div className="min-w-0">
                                    <p className={`text-sm font-bold truncate ${user.isCurrentUser ? 'text-indigo-700' : 'text-gray-700'}`}>
                                        {user.username} {user.isCurrentUser && <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded ml-1">Sen</span>}
                                    </p>
                                    <p className="text-[10px] font-medium text-gray-400 truncate">Seviye {Math.floor(user.totalXp / 1000) + 1}</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end pl-2">
                                <span className="font-black text-indigo-600 text-xs bg-indigo-50 px-2 py-1 rounded-lg whitespace-nowrap">
                                    {user.totalXp} XP
                                </span>
                            </div>
                        </div>
                    ))}
                     {restOfUsers.length === 0 && <div className="text-center py-8 text-gray-400 text-xs italic">Başka maceracı bulunamadı.</div>}
                </div>

                {/* MODAL */}
                {selectedUserId && (
                    <UserProfileModal
                        userId={selectedUserId}
                        onClose={() => setSelectedUserId(null)}
                    />
                )}
            </div>
        </Layout>
    );
}