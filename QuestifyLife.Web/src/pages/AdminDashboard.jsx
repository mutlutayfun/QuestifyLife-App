import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import { format, subDays, isValid } from "date-fns";
import { tr } from "date-fns/locale";

// RECHARTS İMPORTLARI
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [chartDataState, setChartDataState] = useState({ chartData: [], totalRegister: 0, totalActive: 0 }); 
    const [users, setUsers] = useState([]);
    const [quests, setQuests] = useState([]);
    
    // YENİ: Feedback State'leri
    const [feedbacks, setFeedbacks] = useState([]);
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [sendingReply, setSendingReply] = useState(false);
    
    const [userFilter, setUserFilter] = useState("");
    const [questFilter, setQuestFilter] = useState("");

    const [startDate, setStartDate] = useState(subDays(new Date(), 6)); 
    const [endDate, setEndDate] = useState(new Date());

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); 
    const navigate = useNavigate();

    useEffect(() => {
        fetchAdminData();
    }, [startDate, endDate]);

    // Feedbacks sekmesine geçince veriyi çek (Lazy load gibi)
    useEffect(() => {
        if (activeTab === "feedbacks" && feedbacks.length === 0) {
            fetchFeedbacks();
        }
    }, [activeTab]);

    const fetchAdminData = async () => {
        if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) return;

        try {
            setLoading(true);
            const [statsRes, chartRes, usersRes, questsRes] = await Promise.all([
                api.get("/Admin/stats"),
                api.get(`/Admin/chart-data?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`), 
                api.get("/Admin/users"),
                api.get("/Admin/quests")
            ]);
            
            setStats(statsRes.data);

            // --- GÜVENLİ VERİ İŞLEME ---
            let rawData = [];
            let totalReg = 0;
            let totalAct = 0;
            const resData = chartRes.data;

            if (Array.isArray(resData)) {
                rawData = resData;
                totalReg = rawData.reduce((acc, cur) => acc + (cur.YeniUye || cur.yeniUye || 0), 0);
                totalAct = rawData.reduce((acc, cur) => acc + (cur.AktifUye || cur.aktifUye || 0), 0);
            } else if (resData && (resData.chartData || resData.ChartData)) {
                rawData = resData.chartData || resData.ChartData || [];
                totalReg = resData.totalRegisterCount || resData.TotalRegisterCount || 0;
                totalAct = resData.totalActiveUserCount || resData.TotalActiveUserCount || 0;
            }

            const standardizedData = rawData.map(item => ({
                name: item.Name || item.name,
                yeniUye: item.YeniUye || item.yeniUye || 0,
                aktifUye: item.AktifUye || item.aktifUye || 0,
                date: item.Date || item.date
            }));

            setChartDataState({
                chartData: standardizedData,
                totalRegister: totalReg,
                totalActive: totalAct
            });

            setUsers(usersRes.data);
            setQuests(questsRes.data);

        } catch (error) {
            console.error("Admin Veri Hatası:", error);
            if (error.response && error.response.status === 401) {
                toast.error("Oturum süreniz dolmuş olabilir.");
                navigate("/login");
            } else {
                toast.error("Veriler yüklenirken hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    // YENİ: Feedbackleri Çek
    const fetchFeedbacks = async () => {
        try {
            const res = await api.get("/Feedback/admin/all");
            setFeedbacks(res.data);
        } catch (error) {
            console.error("Feedback hatası:", error);
            toast.error("Geri bildirimler alınamadı.");
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
        } catch { toast.error("Hata."); }
    }

    const handleDeleteQuest = async (questId) => {
        if(!confirm("Bu görev sistemden kaldırılacak. Emin misin?")) return;
        try {
            await api.delete(`/Admin/quests/${questId}`);
            toast.success("Görev kaldırıldı.");
            setQuests(quests.filter(q => q.id !== questId));
        } catch { toast.error("Hata."); }
    }

    // YENİ: Cevaplama İşlemi
    const openReplyModal = (feedback) => {
        setSelectedFeedback(feedback);
        setReplyMessage("");
        setReplyModalOpen(true);
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setSendingReply(true);
        try {
            await api.post("/Feedback/admin/reply", {
                feedbackId: selectedFeedback.id,
                replyMessage: replyMessage
            });
            toast.success("Cevap gönderildi! 📧");
            
            // Listeyi güncelle (İncelendi yap)
            setFeedbacks(feedbacks.map(f => 
                f.id === selectedFeedback.id ? { ...f, isReviewed: true } : f
            ));
            
            setReplyModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Cevap gönderilemedi.");
        } finally {
            setSendingReply(false);
        }
    };

    const handleDateChange = (dateString, isStart) => {
        const date = new Date(dateString);
        if (isValid(date)) {
            if (isStart) setStartDate(date);
            else setEndDate(date);
        }
    };

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
                    <button onClick={() => { fetchAdminData(); if(activeTab === 'feedbacks') fetchFeedbacks(); }} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2">
                        🔄 Yenile
                    </button>
                </div>

                {/* Sekmeler */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-8 overflow-x-auto">
                    {["overview", "users", "quests", "feedbacks"].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap
                                ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {tab === "overview" && "📊 Genel Bakış"}
                            {tab === "users" && "👥 Kullanıcılar"}
                            {tab === "quests" && "📝 Görev Akışı"}
                            {tab === "feedbacks" && "💬 Geri Bildirimler"}
                        </button>
                    ))}
                </div>

                {/* 1. GENEL BAKIŞ */}
                {activeTab === "overview" && stats && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <StatCard label="Toplam Kullanıcı" value={stats.totalUsers} color="bg-blue-50 text-blue-600 border-blue-100" />
                            <StatCard label="Toplam Görev" value={stats.totalQuests} color="bg-orange-50 text-orange-600 border-orange-100" />
                            <StatCard label="Dağıtılan Rozet" value={stats.totalBadges} color="bg-yellow-50 text-yellow-600 border-yellow-100" />
                            <StatCard label="Tamamlanma Oranı" value={`%${stats.activeRatio}`} color="bg-green-50 text-green-600 border-green-100" />
                            <StatCard label="Toplam Sistem XP" value={stats.totalSystemXp.toLocaleString()} color="bg-purple-50 text-purple-600 border-purple-100" span="col-span-2 md:col-span-1" />
                        </div>

                        {/* GRAFİK ALANI */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                                    📈 Aktivite Grafiği
                                </h3>
                                
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                                    <input 
                                        type="date" 
                                        value={isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => handleDateChange(e.target.value, true)}
                                        className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
                                    />
                                    <span className="text-gray-400 text-xs font-bold">ARGS</span>
                                    <input 
                                        type="date" 
                                        value={isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => handleDateChange(e.target.value, false)}
                                        className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mb-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span className="text-xs font-bold text-blue-700">Toplam Aktif: {chartDataState.totalActive}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    <span className="text-xs font-bold text-orange-700">Toplam Yeni: {chartDataState.totalRegister}</span>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartDataState.chartData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorAktif" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorYeni" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f39c12" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#f39c12" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="aktifUye" name="Aktif Kullanıcı" stroke="#3498db" fillOpacity={1} fill="url(#colorAktif)" strokeWidth={3} />
                                        <Area type="monotone" dataKey="yeniUye" name="Yeni Kayıt" stroke="#f39c12" fillOpacity={1} fill="url(#colorYeni)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. KULLANICILAR */}
                {activeTab === "users" && (
                    <div className="animate-fade-in">
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

                {/* 4. GERİ BİLDİRİMLER (YENİ SEKME) */}
                {activeTab === "feedbacks" && (
                    <div className="animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b-2 border-gray-100">
                                        <th className="py-3 pl-2">Gönderen</th>
                                        <th className="py-3">Konu & Puan</th>
                                        <th className="py-3 w-1/3">Mesaj</th>
                                        <th className="py-3 text-right pr-2">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {feedbacks.length > 0 ? feedbacks.map(feed => (
                                        <tr key={feed.id} className={`border-b border-gray-50 transition group ${feed.isReviewed ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'}`}>
                                            <td className="py-3 pl-2 align-top">
                                                <div className="font-bold text-gray-800">{feed.username}</div>
                                                <div className="text-xs text-gray-400">{format(new Date(feed.createdDate), "d MMM yyyy", { locale: tr })}</div>
                                            </td>
                                            <td className="py-3 align-top">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-primary text-xs bg-blue-50 px-2 py-0.5 rounded">{feed.subject}</span>
                                                </div>
                                                <div className="text-yellow-400 text-xs">
                                                    {'★'.repeat(feed.rating)}{'☆'.repeat(5 - feed.rating)}
                                                </div>
                                            </td>
                                            <td className="py-3 align-top">
                                                <div className="text-gray-600 text-sm whitespace-pre-wrap">{feed.message}</div>
                                                {feed.isReviewed && (
                                                    <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                                        ✓ İncelendi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-right pr-2 align-top">
                                                {!feed.isReviewed ? (
                                                    <button 
                                                        onClick={() => openReplyModal(feed)}
                                                        className="px-3 py-1.5 bg-primary text-white hover:bg-blue-600 rounded-lg text-xs font-bold transition shadow-sm"
                                                    >
                                                        ↩️ Cevapla
                                                    </button>
                                                ) : (
                                                    <button disabled className="px-3 py-1.5 text-gray-400 cursor-not-allowed text-xs font-bold">
                                                        Cevaplandı
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-8 text-gray-400 italic">Henüz geri bildirim yok.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* CEVAPLAMA MODALI */}
            {replyModalOpen && selectedFeedback && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setReplyModalOpen(false)}>
                    <div 
                        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setReplyModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                        <h3 className="text-xl font-bold text-gray-800 mb-1">Cevap Yaz</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            <span className="font-bold text-primary">@{selectedFeedback.username}</span> kullanıcısına e-posta gönderilecek.
                        </p>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4 text-sm text-gray-600 italic">
                            "{selectedFeedback.message}"
                        </div>

                        <form onSubmit={handleSendReply}>
                            <textarea 
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                className="w-full border rounded-xl p-3 bg-white focus:outline-primary min-h-[150px] mb-4 text-sm"
                                placeholder="Cevabınızı buraya yazın..."
                                required
                            ></textarea>

                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setReplyModalOpen(false)}
                                    className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={sendingReply}
                                    className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition shadow-lg disabled:opacity-50"
                                >
                                    {sendingReply ? 'Gönderiliyor...' : 'Gönder 📨'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

const StatCard = ({ label, value, color, span = "" }) => (
    <div className={`p-4 rounded-2xl border ${color} ${span} flex flex-col justify-between h-24`}>
        <p className="text-[10px] font-black uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-2xl font-black">{value}</p>
    </div>
);