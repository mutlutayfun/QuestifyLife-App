import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import StatsCard from '../components/StatsCard';
import QuestItem from '../components/QuestItem';
import AddQuestForm from '../components/AddQuestForm';
import Layout from '../components/Layout'; // Layout import edildi
import DayEndModal from '../components/DayEndModal'; 
import EditQuestModal from '../components/EditQuestModal';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const [isDayEndModalOpen, setIsDayEndModalOpen] = useState(false);

    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [editingQuest, setEditingQuest] = useState(null);

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

    const handleFinishDay = async (note) => {
        try {
            const response = await api.post('/Performance/finish-day', { note });
            
            setIsDayEndModalOpen(false); 

            if (!response.data.isSuccess) {
                toast.warning(response.data.message);
                return;
            }

            toast.success(response.data.message); 
            
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);

            if(response.data.newBadges && response.data.newBadges.length > 0) {
                toast.info(`🏅 Yeni Rozet: ${response.data.newBadges.join(", ")}`);
            }

            setRefreshTrigger(prev => prev + 1); 

        } catch (error) {
            console.error(error);
            toast.error("Gün kapatılırken hata oluştu.");
        }
    };
    const handleUpdateQuest = async (updatedQuest) => {
        try {
            // updatedQuest nesnesinde: id, title, description, rewardPoints, category olmalı
            // Backend DTO'su "RewardPoints" bekliyor, dikkat et (QuestItem'dan gelen veri yapısına göre)
            const payload = {
                id: updatedQuest.id,
                title: updatedQuest.title,
                description: updatedQuest.description,
                rewardPoints: updatedQuest.rewardPoints || updatedQuest.points, // İsimlendirme farkına dikkat
                category: updatedQuest.category
            };

            await api.put('/Quests', payload); 
            toast.success("Görev güncellendi! ✨");
            setRefreshTrigger(p => p + 1); 
        } catch (error) {
            console.error(error);
            toast.error("Güncelleme başarısız.");
        }
    };

    const handleToggleQuest = async (id) => {
        try {
            const res = await api.post(`/Quests/toggle/${id}`);
            const isCompletedNow = res.data.isCompleted;

            if (isCompletedNow) {
                toast.success(`Görev tamamlandı! +${res.data.earnedPoints} XP ✨`);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            } else {
                toast.info("Görev geri alındı. Puan silindi. ↩️");
            }
            
            // Eğer yeni rozet varsa
            if(res.data.newBadges && res.data.newBadges.length > 0) {
                 toast.info(`🏅 Yeni Rozet: ${res.data.newBadges.join(", ")}`);
            }

            setRefreshTrigger(p => p + 1);
        } catch {
            toast.error("İşlem hatası.");
        }
    };
    const handlePinQuest = async (id) => {
        try {
            const res = await api.post(`/Quests/pin/${id}`);
            const message = res.data.message;
            toast.info(message); // "Görev sabitlendi" veya "Kaldırıldı"
            setRefreshTrigger(p => p + 1); // İkonu güncellemek için listeyi yenile
        } catch {
            toast.error("İşlem başarısız.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary animate-pulse">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="relative">
                {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} />}

                <DayEndModal 
                    isOpen={isDayEndModalOpen} 
                    onClose={() => setIsDayEndModalOpen(false)} 
                    onConfirm={handleFinishDay}
                    summary={dashboardData}
                />
                  <EditQuestModal 
                    isOpen={!!editingQuest} 
                    onClose={() => setEditingQuest(null)} 
                    onUpdate={handleUpdateQuest} 
                    quest={editingQuest}
                />

                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-primary tracking-tight">QuestifyLife</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ana Sayfa</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">{user?.username}</span>
                            <button 
                                onClick={() => setIsDayEndModalOpen(true)}
                                className="bg-dark text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-gray-800 transition shadow-sm flex items-center gap-1"
                            >
                                <span>🌙</span> Bitir
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-6 animate-fade-in-up">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Ana Sayfa</h2>
                    </div>

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
                                    onToggle={handleToggleQuest}
                                    onDelete={handleDeleteQuest}
                                    onEdit={(q) => setEditingQuest(q)}
                                    onPin={handlePinQuest}
                                    isDayClosed={dashboardData?.isDayClosed}
                                />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </Layout>
    );
}
