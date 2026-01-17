import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [quests, setQuests] = useState([]);
    
    // YENİ: Filtreleme State'leri
    const [userFilter, setUserFilter] = useState("");
    const [questFilter, setQuestFilter] = useState("");

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, questsRes] = await Promise.all([
                api.get("/Admin/stats"),
                api.get("/Admin/users"),
                api.get("/Admin/quests")
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setQuests(questsRes.data);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 401) {
                toast.error("Yetkisiz giriş!");
                navigate("/");
            } else {
                toast.error("Veriler yüklenirken hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleAdmin = async (userId) => {
        if(!confirm("Yetki değiştirilsin mi?")) return;
        try {
            await api.post(`/Admin/toggle-admin/${userId}`);
            toast.success("Yetki güncellendi.");
            const res = await api.get("/Admin/users"); 
            setUsers(res.data);
        } catch { toast.error("İşlem başarısız."); }
    };

    const handleDeleteUser = async (userId) => {
        if(!confirm("DİKKAT! Kullanıcı silinecek.")) return;
        try {
            await api.delete(`/Admin/users/${userId}`);
            toast.success("Silindi.");
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) 
        { console.error(error); { toast.error("Hata."); } }
    }

    const handleDeleteQuest = async (questId) => {
        if(!confirm("Bu görev sistemden kaldırılacak. Emin misin?")) return;
        try {
            await api.delete(`/Admin/quests/${questId}`);
            toast.success("Görev kaldırıldı.");
            setQuests(quests.filter(q => q.id !== questId));
        } catch (error) {
            console.error(error);
            toast.error("Hata.");
        }
    }

    // YENİ: Filtreleme Mantığı
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(userFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(userFilter.toLowerCase())
    );

    const filteredQuests = quests.filter(quest => 
        quest.title.toLowerCase().includes(questFilter.toLowerCase()) ||
        quest.description?.toLowerCase().includes(questFilter.toLowerCase()) ||
        quest.username.toLowerCase().includes(questFilter.toLowerCase())
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold animate-pulse">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-24 animate-fade-in-up">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                            <span className="text-4xl">🎛️</span> Yönetim Merkezi
                        </h1>
                        <p className="text-gray-500 text-sm font-medium mt-1">Sistemin genel durumunu izle ve yönet.</p>
                    </div>
                    <button onClick={fetchAdminData} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2">
                        🔄 Yenile
                    </button>
                </div>

                {/* Sekmeler */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto">
                    {["overview", "users", "quests"].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap
                                ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {tab === "overview" && "📊 Genel Bakış"}
                            {tab === "users" && "👥 Kullanıcılar"}
                            {tab === "quests" && "📝 Görev Akışı"}
                        </button>
                    ))}
                </div>

                {/* --- SEKME İÇERİKLERİ --- */}

                {/* 1. GENEL BAKIŞ */}
                {activeTab === "overview" && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
                        <StatCard label="Toplam Kullanıcı" value={stats.totalUsers} color="bg-blue-50 text-blue-600 border-blue-100" />
                        <StatCard label="Toplam Görev" value={stats.totalQuests} color="bg-orange-50 text-orange-600 border-orange-100" />
                        <StatCard label="Dağıtılan Rozet" value={stats.totalBadges} color="bg-yellow-50 text-yellow-600 border-yellow-100" />
                        <StatCard label="Tamamlanma Oranı" value={`%${stats.activeRatio}`} color="bg-green-50 text-green-600 border-green-100" />
                        <StatCard label="Toplam Sistem XP" value={stats.totalSystemXp.toLocaleString()} color="bg-purple-50 text-purple-600 border-purple-100" span="col-span-2 md:col-span-1" />
                    </div>
                )}

                {/* 2. KULLANICILAR */}
                {activeTab === "users" && (
                    <div className="animate-fade-in">
                        {/* YENİ: Arama Kutusu */}
                        <div className="mb-4 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Kullanıcı adı veya email ara..." 
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm"
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b-2 border-gray-100">
                                        <th className="py-3 pl-2">Kullanıcı</th>
                                        <th className="py-3">Durum</th>
                                        <th className="py-3">İstatistik</th>
                                        <th className="py-3 text-right pr-2">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition group">
                                            <td className="py-3 pl-2">
                                                <div className="font-bold text-gray-800">{user.username}</div>
                                                <div className="text-xs text-gray-400">{user.email}</div>
                                            </td>
                                            <td className="py-3">
                                                {user.isAdmin 
                                                    ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs font-black">ADMIN</span>
                                                    : <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs font-bold">Üye</span>
                                                }
                                            </td>
                                            <td className="py-3">
                                                <div className="flex gap-2">
                                                    <span className="text-xs bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-100">🔥 {user.currentStreak} Gün</span>
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">📝 {user.questCount} Görev</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right pr-2">
                                                <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleToggleAdmin(user.id)} className="p-1.5 bg-white border hover:bg-gray-100 rounded-lg" title="Yetkiyi Değiştir">🛡️</button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-lg" title="Sil">🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-400 italic">Kullanıcı bulunamadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. GÖREVLER */}
                {activeTab === "quests" && (
                    <div className="animate-fade-in">
                        {/* YENİ: Arama Kutusu */}
                        <div className="mb-4 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Görev, açıklama veya kullanıcı ara..." 
                                value={questFilter}
                                onChange={(e) => setQuestFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm"
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl mb-4 text-sm text-blue-700 border border-blue-100">
                            ℹ️ Burada sisteme eklenen <b>son 100 görevi</b> görebilirsin.
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b-2 border-gray-100">
                                        <th className="py-3 pl-2">Görev</th>
                                        <th className="py-3">Kullanıcı</th>
                                        <th className="py-3">Tarih</th>
                                        <th className="py-3 text-right pr-2">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredQuests.length > 0 ? filteredQuests.map(quest => (
                                        <tr key={quest.id} className="border-b border-gray-50 hover:bg-gray-50 transition group">
                                            <td className="py-3 pl-2 max-w-[200px]">
                                                <div className="font-bold text-gray-800 truncate" title={quest.title}>{quest.title}</div>
                                                <div className="text-xs text-gray-400 truncate" title={quest.description}>{quest.description || "Açıklama yok"}</div>
                                                <div className="mt-1 flex gap-1">
                                                    <span className="text-[10px] bg-gray-100 px-1.5 rounded">{quest.category || "Genel"}</span>
                                                    <span className="text-[10px] bg-green-50 text-green-600 px-1.5 rounded border border-green-100">+{quest.rewardPoints} XP</span>
                                                </div>
                                            </td>
                                            <td className="py-3 font-medium text-primary">@{quest.username}</td>
                                            <td className="py-3 text-gray-500 text-xs">
                                                {format(new Date(quest.scheduledDate), "d MMM HH:mm", { locale: tr })}
                                            </td>
                                            <td className="py-3 text-right pr-2">
                                                <button 
                                                    onClick={() => handleDeleteQuest(quest.id)} 
                                                    className="px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-bold transition opacity-60 group-hover:opacity-100"
                                                >
                                                    Kaldır
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-400 italic">Görev bulunamadı.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

const StatCard = ({ label, value, color, span = "" }) => (
    <div className={`p-4 rounded-2xl border ${color} ${span} flex flex-col justify-between h-24`}>
        <p className="text-[10px] font-black uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-2xl font-black">{value}</p>
    </div>
);