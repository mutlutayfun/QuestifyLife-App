import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import UserProfileModal from '../components/UserProfileModal';
import { toast } from 'react-toastify';

// Avatar Haritası
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

export default function Friends() {
    const [activeTab, setActiveTab] = useState('leaderboard'); // leaderboard, add, requests
    const [loading, setLoading] = useState(false);
    
    // Veriler
    const [leaderboard, setLeaderboard] = useState([]);
    const [requests, setRequests] = useState([]);
    
    const [inputToAdd, setInputToAdd] = useState(""); 
    
    const [viewProfileId, setViewProfileId] = useState(null);

    useEffect(() => {
        if (activeTab === 'leaderboard') fetchLeaderboard();
        if (activeTab === 'requests') fetchRequests();
    }, [activeTab]);

    // --- API İSTEKLERİ ---

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Friends/leaderboard');
            setLeaderboard(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/Friends/pending-requests');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (e) => {
        e.preventDefault();
        if (!inputToAdd.trim()) return;
        
        try {
            const payload = { usernameOrEmail: inputToAdd }; 
            const res = await api.post('/Friends/send-request', payload);
            
            if (res.data.isSuccess) {
                 toast.success(res.data.message || "İstek gönderildi!");
            } else {
                 toast.success(res.data.message || "İstek gönderildi!");
            }
            
            setInputToAdd("");
        } catch (err) {
            const msg = err.response?.data?.message || "İstek gönderilemedi.";
            toast.error(msg);
        }
    };

    const respondToRequest = async (requestId, accept) => {
        try {
            await api.post(`/Friends/respond/${requestId}?accept=${accept}`);
            fetchRequests();
            toast.success(accept ? "Arkadaş eklendi!" : "İstek reddedildi.");
        } catch (err) {
            console.error(err);
            toast.error("İşlem başarısız.");
        }
    };

    const removeFriend = async (friendId) => {
        if(!confirm("Arkadaşını silmek istediğine emin misin?")) return;
        try {
            await api.post(`/Friends/remove/${friendId}`);
            fetchLeaderboard();
            toast.success("Arkadaş listenden çıkarıldı.");
        } catch (err) {
            console.error(err);
            toast.error("Silinemedi.");
        }
    }

    return (
        <Layout>
            <div className="max-w-md mx-auto pb-24">
                {/* 🌟 HEADER - Pembe/Gül Temalı */}
                <div className="relative mb-6">
                     <div className="h-32 bg-gradient-to-r from-pink-500 to-rose-500 rounded-b-[2.5rem] shadow-lg overflow-hidden relative flex flex-col items-center justify-center text-center">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-x-5 -translate-y-5 blur-xl"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-10 translate-y-10 blur-xl"></div>
                        
                        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md relative z-10 flex items-center gap-2">
                             <span>🤝</span> Sosyal Çevre
                        </h1>
                        <p className="text-pink-100 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">Arkadaşlarınla Yarış</p>
                    </div>
                </div>

                {/* TAB BUTONLARI */}
                <div className="flex bg-white p-1.5 rounded-2xl mx-4 mb-6 shadow-sm border border-gray-100 relative z-10 -mt-8">
                    <button 
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'leaderboard' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        <span>🏆</span> Sıralama
                    </button>
                    <button 
                        onClick={() => setActiveTab('add')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'add' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        <span>➕</span> Ekle
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'requests' ? 'bg-rose-100 text-rose-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        <div className="relative">
                            <span>📩</span>
                            {requests.length > 0 && <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">{requests.length}</span>}
                        </div>
                        <span className={requests.length > 0 ? 'pr-1' : ''}>İstekler</span>
                    </button>
                </div>

                {/* İÇERİK ALANI */}
                <div className="px-4">
                    {loading && (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    {!loading && activeTab === 'leaderboard' && (
                        <div className="space-y-3 animate-fade-in-up">
                            {leaderboard.map((friend, index) => (
                                <div 
                                    key={friend.friendId} 
                                    onClick={() => setViewProfileId(friend.friendId)} 
                                    className={`relative group bg-white p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between
                                        ${friend.username.includes("(Sen)") 
                                            ? 'border-rose-200 bg-rose-50/30 shadow-sm' 
                                            : 'border-gray-100 hover:border-rose-100 hover:shadow-md'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {/* Sıra Numarası */}
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {index + 1}
                                        </div>
                                        
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 p-0.5 flex-shrink-0">
                                            <img 
                                                src={AVATAR_MAP[friend.avatarId] || AVATAR_MAP['avatar_1']} 
                                                className="w-full h-full object-contain" 
                                                onError={(e) => e.target.src = AVATAR_MAP['avatar_1']} 
                                                alt="Avatar"
                                            />
                                        </div>
                                        
                                        {/* İsim ve Bilgi */}
                                        <div className="min-w-0">
                                            <p className={`text-sm font-bold truncate ${friend.username.includes("(Sen)") ? 'text-rose-600' : 'text-gray-800'}`}>
                                                {friend.username.replace(" (Sen)", "")} {friend.username.includes("(Sen)") && <span className="text-[10px] bg-rose-100 px-1.5 py-0.5 rounded text-rose-600 ml-1">Sen</span>}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-medium">Seviye {Math.floor(friend.totalXp / 1000) + 1}</p>
                                        </div>
                                    </div>
                                    
                                    {/* XP ve Sil Butonu */}
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-rose-500 text-sm">{friend.totalXp} XP</span>
                                        
                                        {!friend.username.includes("(Sen)") && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFriend(friend.friendId);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
                                                title="Arkadaşlıktan Çıkar"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <div className="text-center py-10 opacity-60">
                                    <img src="/Characters/Sad_Fox_BF.png" className="w-32 h-32 mx-auto opacity-50 mb-2 grayscale" alt="Empty" />
                                    <p className="text-gray-500 text-sm">Henüz kimse yok. Arkadaşlarını davet et!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && activeTab === 'add' && (
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 text-center animate-fade-in-up">
                            <div className="w-24 h-24 bg-rose-50 rounded-full mx-auto flex items-center justify-center mb-4">
                                <span className="text-5xl">💌</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-2">Arkadaşlarını Bul</h3>
                            <p className="text-xs text-gray-500 mb-6 px-4">Kullanıcı adı veya e-posta adresi girerek maceraya ortak arkadaşlarını ekle.</p>
                            
                            <form onSubmit={sendFriendRequest}>
                                <div className="relative mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="Kullanıcı Adı veya E-posta"
                                        className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 bg-gray-50 transition-all text-sm font-medium"
                                        value={inputToAdd}
                                        onChange={(e) => setInputToAdd(e.target.value)}
                                        required
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                </div>
                                <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-rose-200 transform active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <span>İstek Gönder</span>
                                    <span>🚀</span>
                                </button>
                            </form>
                        </div>
                    )}

                    {!loading && activeTab === 'requests' && (
                        <div className="space-y-3 animate-fade-in-up">
                            {requests.map(req => (
                                <div key={req.requestId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl">
                                            👤
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{req.senderUsername}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Arkadaşlık isteği gönderdi</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => respondToRequest(req.requestId, false)}
                                            className="w-9 h-9 rounded-full border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 flex items-center justify-center transition-all"
                                        >
                                            ✕
                                        </button>
                                        <button 
                                            onClick={() => respondToRequest(req.requestId, true)}
                                            className="w-9 h-9 rounded-full bg-green-500 text-white shadow-md shadow-green-200 hover:bg-green-600 flex items-center justify-center transition-all"
                                        >
                                            ✓
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-3xl border border-gray-50 dashed border-2">
                                    <p className="text-gray-400 text-sm font-medium">Bekleyen istek yok ✨</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal */}
                {viewProfileId && (
                    <UserProfileModal 
                        userId={viewProfileId} 
                        onClose={() => setViewProfileId(null)} 
                    />
                )}
            </div>
        </Layout>
    );
}