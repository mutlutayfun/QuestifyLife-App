import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';

// Avatar Emojileri (Profile.jsx ile aynı mantık)
const getAvatarEmoji = (id) => {
    const map = {
        'avatar_1': '👨‍💻', 'avatar_2': '🦸‍♀️', 
        'avatar_3': '🥷', 'avatar_4': '🧑‍🚀', 'avatar_5': '🧙‍♂️'
    };
    return map[id] || '👤';
};

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/Performance/leaderboard');
                if (res.data.success) {
                    setUsers(res.data.data);
                }
            } catch (error) {
                console.error("Liderlik tablosu hatası:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <Layout><div className="text-center mt-10 font-bold text-primary animate-pulse">SIRALAMA YÜKLENİYOR...</div></Layout>;

    const topThree = users.slice(0, 3); // İlk 3 kişi (Kürsü)
    const restOfUsers = users.slice(3); // Geri kalanlar (Liste)

    return (
        <Layout>
            <div className="max-w-md mx-auto px-4 pb-20"> {/* pb-20: Alt bar için boşluk */}
                
                {/* Başlık */}
                <div className="text-center py-6">
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight">Liderlik Tablosu</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">En Efsanevi Maceracılar</p>
                </div>

                {/* 🏆 KÜRSÜ ALANI (TOP 3) */}
                <div className="flex justify-center items-end gap-4 mb-8 h-48">
                    
                    {/* 2. SIRA (GÜMÜŞ) */}
                    {topThree[1] && (
                        <div className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <div className="w-16 h-16 rounded-full border-4 border-gray-300 bg-white flex items-center justify-center text-3xl shadow-lg relative mb-2 z-10">
                                {getAvatarEmoji(topThree[1].avatarId)}
                                <div className="absolute -bottom-2 bg-gray-300 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">#2</div>
                            </div>
                            <div className="bg-gradient-to-t from-gray-200 to-gray-100 w-20 h-24 rounded-t-xl flex flex-col items-center justify-end p-2 shadow-sm border-t border-gray-300">
                                <span className="font-bold text-xs text-gray-600 truncate w-full text-center">{topThree[1].username}</span>
                                <span className="font-black text-sm text-gray-800">{topThree[1].totalXp}</span>
                            </div>
                        </div>
                    )}

                    {/* 1. SIRA (ALTIN) */}
                    {topThree[0] && (
                        <div className="flex flex-col items-center animate-fade-in-up z-20">
                            <div className="text-4xl mb-1 animate-bounce-slow">👑</div>
                            <div className="w-20 h-20 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center text-4xl shadow-xl relative mb-2">
                                {getAvatarEmoji(topThree[0].avatarId)}
                                <div className="absolute -bottom-3 bg-yellow-400 text-white text-xs font-bold px-3 py-0.5 rounded-full border-2 border-white">#1</div>
                            </div>
                            <div className="bg-gradient-to-t from-yellow-100 to-yellow-50 w-24 h-32 rounded-t-xl flex flex-col items-center justify-end p-3 shadow-md border-t border-yellow-200">
                                <span className="font-bold text-sm text-yellow-800 truncate w-full text-center">{topThree[0].username}</span>
                                <span className="font-black text-lg text-yellow-600">{topThree[0].totalXp} XP</span>
                            </div>
                        </div>
                    )}

                    {/* 3. SIRA (BRONZ) */}
                    {topThree[2] && (
                        <div className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                            <div className="w-16 h-16 rounded-full border-4 border-orange-200 bg-white flex items-center justify-center text-3xl shadow-lg relative mb-2 z-10">
                                {getAvatarEmoji(topThree[2].avatarId)}
                                <div className="absolute -bottom-2 bg-orange-300 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">#3</div>
                            </div>
                            <div className="bg-gradient-to-t from-orange-100 to-orange-50 w-20 h-20 rounded-t-xl flex flex-col items-center justify-end p-2 shadow-sm border-t border-orange-200">
                                <span className="font-bold text-xs text-orange-800 truncate w-full text-center">{topThree[2].username}</span>
                                <span className="font-black text-sm text-orange-600">{topThree[2].totalXp}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 📜 LİSTE ALANI (4. ve Sonrası) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    {restOfUsers.map((user) => (
                        <div 
                            key={user.rank} 
                            className={`flex items-center justify-between p-4 border-b border-gray-50 last:border-none transition-colors
                                ${user.isCurrentUser ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-gray-400 w-6 text-center">{user.rank}</span>
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl border border-gray-200">
                                    {getAvatarEmoji(user.avatarId)}
                                </div>
                                <div>
                                    <span className={`block text-sm font-bold ${user.isCurrentUser ? 'text-primary' : 'text-gray-700'}`}>
                                        {user.username} {user.isCurrentUser && '(Sen)'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Maceracı</span>
                                </div>
                            </div>
                            <span className="font-black text-gray-600 text-sm">{user.totalXp} XP</span>
                        </div>
                    ))}

                    {restOfUsers.length === 0 && (
                        <div className="text-center py-6 text-gray-400 text-xs italic">
                            Başka maceracı bulunamadı.
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}