import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axiosConfig';
import StatsCard from '../components/StatsCard';
import QuestItem from '../components/QuestItem';
import AddQuestForm from '../components/AddQuestForm';
import Layout from '../components/Layout';
import DayEndModal from '../components/DayEndModal'; 
import EditQuestModal from '../components/EditQuestModal';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [pinnedTemplates, setPinnedTemplates] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const [isDayEndModalOpen, setIsDayEndModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [editingQuest, setEditingQuest] = useState(null);

    // Pencere boyutu izleme
    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // VERİ ÇEKME
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Backend'den Dashboard verisini çekiyoruz
                const response = await api.get('/Performance/dashboard');
                
                setDashboardData(response.data);
                
                if (response.data.pinnedTemplates) {
                    setPinnedTemplates(response.data.pinnedTemplates);
                } else {
                    setPinnedTemplates([]);
                }

            } catch (error) {
                console.error("Veri hatası:", error);
                if(error.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger, logout]);

    // MANUEL GÖREV EKLEME (Senin Orijinal Kodun)
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

    // ŞABLONDAN EKLEME
    const handleAddFromTemplate = async (template) => {
        if (dashboardData?.isDayClosed) {
            toast.warning("Gün kapandı, yeni görev ekleyemezsin!");
            return;
        }

        const newQuestData = {
            title: template.title,
            description: template.description || "",
            rewardPoints: template.rewardPoints,
            category: template.category || "Genel",
            colorCode: template.colorCode || "#3498db",
            scheduledDate: new Date().toISOString()
        };

        try {
            await api.post('/Quests', newQuestData);
            setRefreshTrigger(prev => prev + 1);
            toast.success(`"${template.title}" bugüne eklendi! 🚀`);
        } catch (error) {
            console.error(error);
            toast.error("Ekleme başarısız.");
        }
    };

    // GÖREV SİLME
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

    // GÜNÜ BİTİRME
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

    // GÖREV GÜNCELLEME
    const handleUpdateQuest = async (updatedQuest) => {
        try {
            const payload = {
                id: updatedQuest.id,
                title: updatedQuest.title,
                description: updatedQuest.description,
                rewardPoints: updatedQuest.rewardPoints || updatedQuest.points, 
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

    // GÖREV TAMAMLAMA/GERİ ALMA
    const handleToggleQuest = async (id) => {
        try {
            const res = await api.post(`/Quests/toggle/${id}`);
            
            if(res.data) {
                const isCompletedNow = res.data.isCompleted;

                if (isCompletedNow) {
                    toast.success(`Görev tamamlandı! +${res.data.earnedPoints} XP ✨`);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                } else {
                    toast.info("Görev geri alındı. Puan silindi. ↩️");
                }
                
                if(res.data.newBadges && res.data.newBadges.length > 0) {
                     toast.info(`🏅 Yeni Rozet: ${res.data.newBadges.join(", ")}`);
                }
                setRefreshTrigger(p => p + 1);
            }
        } catch {
            toast.error("İşlem hatası.");
        }
    };

    // GÖREVİ PINLEME / UNPIN YAPMA
    const handlePinQuest = async (id) => {
        try {
            const res = await api.post(`/Quests/pin/${id}`);
            
            // Eğer pinlendiyse veya kaldırıldıysa mesaj göster
            toast.info(res.data.message || "İşlem başarılı"); 
            
            setRefreshTrigger(p => p + 1); 
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

                <main className="max-w-md mx-auto px-4 py-6 animate-fade-in-up space-y-6">
                    
                    {/* İSTATİSTİK KARTLARI */}
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-gray-800">Ana Sayfa</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transform transition hover:scale-105 duration-300">
                        <div>
                            <p className="text-gray-500 text-xs font-bold uppercase">Toplam XP</p>
                            <p className="text-2xl font-bold text-dark">{dashboardData?.totalXp}</p>
                        </div>
                        <div className="text-4xl animate-bounce-slow">👑</div>
                    </div>

                    {/* SIK KULLANILANLAR (PİNLENENLER) */}
                    {pinnedTemplates && pinnedTemplates.length > 0 && (
                        <div className="animate-fade-in">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">📌 Sık Kullanılanlar</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {pinnedTemplates.map((template) => (
                                    <div 
                                        key={template.id} 
                                        className="min-w-[140px] bg-white p-3 rounded-2xl border border-gray-100 shadow-sm snap-start hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                        onClick={() => handleAddFromTemplate(template)}
                                    >
                                        {/* Ekle Butonu (Sağ Üst) */}
                                        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-bold">+ Ekle</span>
                                        </div>

                                        {/* YENİ: Pin Kaldırma Butonu (Sol Üst) */}
                                        <button 
                                            className="absolute top-0 left-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Kartın kendisine tıklanmasını (görev eklemesini) engeller
                                                if(confirm("Bu şablonu sık kullanılanlardan kaldırmak istediğine emin misin?")) {
                                                    handlePinQuest(template.id);
                                                }
                                            }}
                                            title="Sık kullanılanlardan kaldır"
                                        >
                                            <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-md font-bold hover:bg-red-100 hover:text-red-600 transition-colors">
                                                Kaldır
                                            </span>
                                        </button>

                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2" style={{backgroundColor: `${template.colorCode || '#3498db'}20`, color: template.colorCode || '#3498db'}}>
                                            {template.title.charAt(0).toUpperCase()}
                                        </div>
                                        <h4 className="font-bold text-gray-700 text-sm truncate mb-1">{template.title}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                            +{template.rewardPoints} XP
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>⚡</span> Bugünün Görevleri
                    </h2>
                    
                    {/* GÖREV EKLEME FORMU */}
                    <AddQuestForm onAdd={handleAddQuest} disabled={dashboardData?.isDayClosed} />

                    {/* GÖREV LİSTESİ */}
                    <div className="space-y-2 mt-4">
                        {(!dashboardData?.todayQuests || dashboardData.todayQuests.length === 0) ? (
                            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                                <p>Henüz bugün için bir görevin yok.</p>
                                <p className="text-sm">Hadi bir tane ekle ve günü kazan!</p>
                            </div>
                        ) : (
                            dashboardData.todayQuests.map(quest => (
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