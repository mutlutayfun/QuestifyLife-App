import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import StatsCard from '../components/StatsCard';
import QuestItem from '../components/QuestItem';
import AddQuestForm from '../components/AddQuestForm';
import Layout from '../components/Layout';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Veriyi yenilemek için tetikleyici

    // Verileri API'den Çek
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Dashboard endpoint'i userId'yi token'dan alır, parametreye gerek yok
                const response = await api.get('/Performance/dashboard');
                setDashboardData(response.data);
            } catch (error) {
                console.error("Veri çekme hatası:", error);
                // Token süresi dolmuşsa çıkış yap
                if(error.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger, logout]); // refreshTrigger değişince tekrar çalışır

    // Görev Ekleme İşlemi
    const handleAddQuest = async (questData) => {
        try {
            await api.post('/Quests', questData);
            setRefreshTrigger(prev => prev + 1); // Listeyi yenile
        } catch (error) {
            console.error("Ekleme hatası:", error); // Hatayı konsola basarak 'unused var' uyarısını çözdük
            alert("Görev eklenirken hata oluştu!");
        }
    };

    // Görev Tamamlama İşlemi
    const handleCompleteQuest = async (id) => {
        try {
            const response = await api.post(`/Quests/complete/${id}`);
            
            // Eğer yeni rozet kazanıldıysa müjde ver!
            if(response.data.newBadges && response.data.newBadges.length > 0) {
                alert(`Tebrikler! Yeni Rozet Kazandın: ${response.data.newBadges.join(", ")} 🏅`);
            }
            
            setRefreshTrigger(prev => prev + 1); // Puanları güncelle
        } catch (error) {
            console.error("Tamamlama hatası:", error);
        }
    };

    // Görev Silme İşlemi
    const handleDeleteQuest = async (id) => {
        if(!confirm("Bu görevi silmek istediğine emin misin?")) return;
        
        try {
            await api.delete(`/Quests/${id}`);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Silme hatası:", error); // Hatayı konsola basarak 'unused var' uyarısını çözdük
            alert("Silme işlemi başarısız.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary">Yükleniyor...</div>;

    return (
    <Layout>
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Üst Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">QuestifyLife</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 font-medium">{user?.username}</span>
                        <button onClick={logout} className="text-xs text-red-500 hover:underline">Çıkış</button>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6">
                {/* İstatistikler */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatsCard 
                        title="Günlük Puan" 
                        value={`${dashboardData?.pointsEarnedToday} / ${dashboardData?.dailyTarget}`} 
                        icon="🎯" 
                        color="border-primary"
                    />
                    <StatsCard 
                        title="Seri (Gün)" 
                        value={dashboardData?.currentStreak} 
                        icon="🔥" 
                        color="border-secondary" 
                    />
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Toplam XP</p>
                        <p className="text-2xl font-bold text-dark">{dashboardData?.totalXp}</p>
                    </div>
                    <div className="text-4xl">👑</div>
                </div>

                {/* Görev Listesi */}
                <h2 className="text-lg font-bold text-gray-800 mb-4">Bugünün Görevleri</h2>
                
                {/* Görev Ekleme Formu */}
                <AddQuestForm onAdd={handleAddQuest} />

                {/* Liste */}
                <div className="space-y-2">
                    {dashboardData?.todayQuests.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p>Henüz bugün için bir görevin yok.</p>
                            <p className="text-sm">Hadi bir tane ekle!</p>
                        </div>
                    ) : (
                        dashboardData?.todayQuests.map(quest => (
                            <QuestItem 
                                key={quest.id} 
                                quest={quest} 
                                onComplete={handleCompleteQuest}
                                onDelete={handleDeleteQuest}
                            />
                        ))
                    )}
                </div>
            </main>
        </div>
    </Layout>
    );
}