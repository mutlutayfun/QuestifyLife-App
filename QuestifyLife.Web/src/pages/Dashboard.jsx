import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import StatsCard from '../components/StatsCard';
import QuestItem from '../components/QuestItem';
import AddQuestForm from '../components/AddQuestForm';

// Süsleme Importları
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Konfeti State'i
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Ekran boyutu değişirse konfetiyi ayarla
    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/Performance/dashboard');
                setDashboardData(response.data);
            } catch (error) {
                console.error(error);
                if(error.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, logout]);

    const handleAddQuest = async (questData) => {
        try {
            await api.post('/Quests', questData);
            setRefreshTrigger(prev => prev + 1);
            toast.success("Görev başarıyla eklendi! 🚀");
        } catch (error) {
            console.error(error);
            toast.error("Görev eklenirken hata oluştu.");
        }
    };

    const handleCompleteQuest = async (id) => {
        try {
            const response = await api.post(`/Quests/complete/${id}`);
            
            // Konfeti Patlat! 🎉
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000); // 5 saniye sonra durdur

            // Rozet Bildirimi
            if(response.data.newBadges && response.data.newBadges.length > 0) {
                // Özel Rozet Toast'ı
                toast.info(
                    <div>
                        <h4 className="font-bold">🏅 Yeni Rozet Kazandın!</h4>
                        <p>{response.data.newBadges.join(", ")}</p>
                    </div>, 
                    { autoClose: 6000 }
                );
            } else {
                toast.success(`Harika! +${response.data.earnedPoints || 10} Puan Kazandın! ✨`);
            }
            
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error(error);
            toast.error("İşlem başarısız.");
        }
    };

    const handleDeleteQuest = async (id) => {
        if(!confirm("Bu görevi silmek istediğine emin misin?")) return;
        
        try {
            await api.delete(`/Quests/${id}`);
            setRefreshTrigger(prev => prev + 1);
            toast.info("Görev silindi.");
        } catch (error) {
            console.error(error);
            toast.error("Silinemedi.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary animate-pulse">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Konfeti Bileşeni (Sadece showConfetti true ise görünür) */}
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />}

            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary tracking-tight">QuestifyLife</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 font-medium">{user?.username}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 animate-fade-in-up">
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

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center transform transition hover:scale-105 duration-300">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Toplam XP</p>
                        <p className="text-2xl font-bold text-dark">{dashboardData?.totalXp}</p>
                    </div>
                    <div className="text-4xl animate-bounce-slow">👑</div>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>⚡</span> Bugünün Görevleri
                </h2>
                
                <AddQuestForm onAdd={handleAddQuest} />

                <div className="space-y-2 mt-4">
                    {dashboardData?.todayQuests.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                            <p>Henüz bugün için bir görevin yok.</p>
                            <p className="text-sm">Hadi bir tane ekle ve günü kazan!</p>
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
    );
}