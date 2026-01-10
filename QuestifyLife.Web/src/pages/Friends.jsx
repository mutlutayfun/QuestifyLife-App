import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import LeaderboardItem from '../components/LeaderboardItem';
import { toast } from 'react-toastify';

export default function Friends() {
    const [activeTab, setActiveTab] = useState('leaderboard'); // leaderboard, add, requests
    const [loading, setLoading] = useState(false);
    
    // Veriler
    const [leaderboard, setLeaderboard] = useState([]);
    const [requests, setRequests] = useState([]);
    const [emailToAdd, setEmailToAdd] = useState("");

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
        try {
            await api.post('/Friends/send-request', { targetEmail: emailToAdd });
            toast.success("İstek gönderildi!");
            setEmailToAdd("");
        } catch (err) {
            toast.error(err.response?.data?.message || "İstek gönderilemedi.");
        }
    };

    const respondToRequest = async (requestId, accept) => {
        try {
            await api.post(`/Friends/respond/${requestId}?accept=${accept}`);
            fetchRequests(); // Listeyi yenile
            toast.success(accept ? "Arkadaş eklendi!" : "İstek reddedildi.");
        } catch (err) {
            console.error(err); // Hata değişkenini kullandık
            toast.error("İşlem başarısız.");
        }
    };

    const removeFriend = async (friendId) => {
        if(!confirm("Arkadaşını silmek istediğine emin misin?")) return;
        try {
            await api.post(`/Friends/remove/${friendId}`);
            fetchLeaderboard();
        } catch (err) {
            console.error(err); // Hata değişkenini kullandık
            toast.error("Silinemedi.");
        }
    }

    return (
        <Layout>
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Sosyal</h1>

                {/* Sekmeler (Tabs) */}
                <div className="flex bg-gray-200 p-1 rounded-lg mb-6">
                    <button 
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'leaderboard' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                    >
                        🏆 Sıralama
                    </button>
                    <button 
                        onClick={() => setActiveTab('add')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'add' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                    >
                        ➕ Ekle
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'requests' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                    >
                        📩 İstekler 
                        {requests.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{requests.length}</span>}
                    </button>
                </div>

                {/* İÇERİK ALANI */}
                {loading && <div className="text-center py-10">Yükleniyor...</div>}

                {!loading && activeTab === 'leaderboard' && (
                    <div className="space-y-2">
                        {leaderboard.map((friend, index) => (
                            <div key={friend.friendId} className="relative group">
                                <LeaderboardItem 
                                    rank={index + 1} 
                                    user={friend} 
                                    isMe={friend.username.includes("(Sen)")} 
                                />
                                {/* Silme Butonu (Sadece arkadaşlar için, kendin için değil) */}
                                {!friend.username.includes("(Sen)") && (
                                    <button 
                                        onClick={() => removeFriend(friend.friendId)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                        title="Arkadaşlıktan Çıkar"
                                    >
                                        ❌
                                    </button>
                                )}
                            </div>
                        ))}
                        {leaderboard.length === 0 && <p className="text-center text-gray-400">Henüz kimse yok. Arkadaş ekle!</p>}
                    </div>
                )}

                {!loading && activeTab === 'add' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-5xl mb-4">🤝</div>
                        <h3 className="font-bold text-gray-800 mb-2">Arkadaşlarını Bul</h3>
                        <p className="text-sm text-gray-500 mb-6">Onların email adresini girerek istek gönderebilirsin.</p>
                        
                        <form onSubmit={sendFriendRequest}>
                            <input 
                                type="email" 
                                placeholder="arkadas@mail.com"
                                className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:border-primary bg-gray-50"
                                value={emailToAdd}
                                onChange={(e) => setEmailToAdd(e.target.value)}
                                required
                            />
                            <button className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition">
                                İstek Gönder
                            </button>
                        </form>
                    </div>
                )}

                {!loading && activeTab === 'requests' && (
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.requestId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-800">{req.senderUsername}</p>
                                    <p className="text-xs text-gray-400">Seni arkadaş olarak eklemek istiyor.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => respondToRequest(req.requestId, true)}
                                        className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200"
                                    >
                                        ✅
                                    </button>
                                    <button 
                                        onClick={() => respondToRequest(req.requestId, false)}
                                        className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"
                                    >
                                        ❌
                                    </button>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <p>Bekleyen istek yok.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}
