import { useEffect, useState, useContext, useRef } from 'react';
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
import { format, addDays, isSameDay, startOfDay, isValid } from 'date-fns'; 
import { tr } from 'date-fns/locale'; 
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronLeft, ChevronRight, Calendar, Star, Trophy, Zap } from 'lucide-react'; 

import DailyQuote from '../components/DailyQuote';
import TutorialModal from '../components/TutorialModal';
import FeedbackModal from '../components/FeedbackModal';
import UserGuideModal from '../components/UserGuideModal';

// Tarayıcı Bildirimi Gönderme Yardımcısı
const sendNotification = (title, body) => {
    if (!("Notification" in window)) {
        console.warn("Bu tarayıcı bildirimleri desteklemiyor.");
        return;
    }
    
    if (Notification.permission === "granted") {
        new Notification(title, { body, icon: '/Happy_Fox_BF.png' });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body, icon: '/Happy_Fox_BF.png' });
            }
        });
    }
};

export default function Dashboard() {
    const { user, logout, updateUser } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [pinnedTemplates, setPinnedTemplates] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [isDayEndModalOpen, setIsDayEndModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [editingQuest, setEditingQuest] = useState(null);

    const [showTutorial, setShowTutorial] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false); 
    const [isAdmin, setIsAdmin] = useState(false);
    

    const notifiedQuestsRef = useRef(new Set());

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ⏰ HATIRLATICI KONTROL MEKANİZMASI
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const checkReminders = () => {
            if (!dashboardData?.todayQuests) return;

            const now = new Date();
            
            dashboardData.todayQuests.forEach(quest => {
                if (quest.reminderDate && !quest.isCompleted && !notifiedQuestsRef.current.has(quest.id)) {
                    
                    const reminderTime = new Date(quest.reminderDate);
                    const diff = reminderTime.getTime() - now.getTime();

                    if (diff <= 0 && diff > -3600000) { 
                        sendNotification("🔔 Görev Zamanı!", `${quest.title} görevini yapma zamanı geldi!`);
                        notifiedQuestsRef.current.add(quest.id);
                    }
                }
            });
        };

        const intervalId = setInterval(checkReminders, 10000);
        checkReminders();

        return () => clearInterval(intervalId);
    }, [dashboardData]);

    // Admin Check
    useEffect(() => {
        const checkAdminStatus = async () => {
             if (user?.isAdmin || user?.IsAdmin) {
                 setIsAdmin(true);
                 return;
             }
             
             try {
                 const res = await api.get('/User/profile');
                 const profile = res.data.data || res.data;
                 
                 if (profile?.isAdmin === true || profile?.IsAdmin === true) {
                     setIsAdmin(true);
                 }
             } catch (e) {
                 console.error("Admin check failed", e);
             }
        };
        if (user) {
            checkAdminStatus();
        }
    }, [user]); 

    // Tutorial Kontrolü
    useEffect(() => {
        const checkTutorialStatus = async () => {
            try {
                if (user && user.hasSeenTutorial === false) {
                     setShowTutorial(true);
                } else if (user && user.hasSeenTutorial === undefined) {
                     const res = await api.get('/User/profile');
                     const profileData = res.data.data || res.data; 
                     
                     if (profileData && profileData.hasSeenTutorial === false) {
                         setShowTutorial(true);
                     }
                }
            } catch (e) {
                console.error("Tutorial check failed", e);
            }
        };
        if (user) {
            checkTutorialStatus();
        }
    }, [user]); 

    const handleTutorialComplete = async (manifestoText) => {
        setShowTutorial(false);
        try {
            await api.put('/User/profile', { 
                hasSeenTutorial: true,
                personalManifesto: manifestoText
            });

            updateUser({ 
                hasSeenTutorial: true,
                personalManifesto: manifestoText
            });
            toast.success("Sözün kaydedildi kahraman! Maceraya hazırsın. 🚀");
        } catch (error) {
            console.error("Tutorial update error:", error);
            updateUser({ hasSeenTutorial: true });
        }
    };

    // VERİ ÇEKME
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!isValid(selectedDate)) return;

                const dayStart = startOfDay(selectedDate);
                dayStart.setHours(12, 0, 0, 0); 
                const formattedDate = format(dayStart, "yyyy-MM-dd'T'HH:mm:ss");
                
                const response = await api.get(`/Performance/dashboard?date=${formattedDate}`);
                
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
    }, [refreshTrigger, logout, selectedDate]); 

    const handlePrevDay = () => setSelectedDate(prev => addDays(prev, -1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));
    const handleGoToday = () => setSelectedDate(new Date());
    const isToday = isSameDay(selectedDate, new Date());
    const isFuture = selectedDate > new Date() && !isToday;

    const handleAddQuest = async (questData) => {
        if (!questData) return;

        const currentRewardPoints = Number(questData.rewardPoints || questData.points || 0);

        if (dashboardData) {
             if (dashboardData.isDayClosed && isToday) {
                 toast.warning("Bugünü zaten bitirdin! Yeni planlar için yarını seçmelisin. 🌙");
                 return;
             }

             // 1. GÖREV SAYISI SINIRI (MAX 50)
             const questCount = dashboardData.todayQuests?.length || 0;
             if (questCount >= 50) {
                 toast.warning("Günlük 50 görev sınırına ulaştınız! Mevcut görevlerden bazılarını silerek yer açabilirsiniz. 🛑");
                 return;
             }
        }

        try {
            const safeDate = isValid(selectedDate) ? startOfDay(selectedDate) : startOfDay(new Date());
            const now = new Date();
            safeDate.setHours(12, now.getMinutes(), now.getSeconds(), now.getMilliseconds());

            const payload = { 
                ...questData, 
                rewardPoints: currentRewardPoints,
                scheduledDate: format(safeDate, "yyyy-MM-dd'T'HH:mm:ss.SSS")
            };
            
            await api.post('/Quests', payload);
            setRefreshTrigger(prev => prev + 1);
            toast.success("Görev başarıyla eklendi! 🚀");
        } catch (error) {
            const errorData = error.response?.data;
            const backendMsg = errorData?.message || (typeof errorData === 'string' ? errorData : "Görev eklenemedi.");
            toast.error(backendMsg);
        }
    };
    
    const handleAddFromTemplate = async (template) => {
        if (!template) return;

        const templatePoints = Number(template.rewardPoints || template.points || 0);

        if (dashboardData) {
             if (dashboardData.isDayClosed && isToday) {
                 toast.warning("Günü kapattın! Şablonu yarına eklemeyi dene. 🌙");
                 return;
             }
             
             // GÖREV SAYISI KONTROLÜ
             const questCount = dashboardData.todayQuests?.length || 0;
             if (questCount >= 50) {
                 toast.warning("Günlük 50 görev sınırına ulaştınız! 🛑");
                 return;
             }
        }

        const safeDate = isValid(selectedDate) ? startOfDay(selectedDate) : startOfDay(new Date());
        const now = new Date();
        safeDate.setHours(12, now.getMinutes(), now.getSeconds(), now.getMilliseconds());

        const newQuestData = {
            title: template.title,
            description: template.description || "",
            rewardPoints: templatePoints,
            category: template.category || "Genel",
            colorCode: template.colorCode || "#3498db",
            scheduledDate: format(safeDate, "yyyy-MM-dd'T'HH:mm:ss.SSS")
        };
        
        try {
            await api.post('/Quests', newQuestData);
            setRefreshTrigger(prev => prev + 1);
            toast.success(`"${template.title}" listeye eklendi! 🚀`);
        } catch (error) {
            const errorData = error.response?.data;
            const backendMsg = errorData?.message || "Şablondan ekleme başarısız.";
            toast.error(backendMsg);
        }
    };

    const handleDeleteQuest = async (id) => {
        if(!confirm("Bu görevi silmek istediğine emin misin?")) return;
        try {
            await api.delete(`/Quests/${id}`);
            setRefreshTrigger(prev => prev + 1);
            toast.info("Görev silindi.");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Silme işlemi başarısız.");
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
            
            setRefreshTrigger(prev => prev + 1); 
        } catch (error) {
            console.error("Finish day error:", error);
            toast.error("Gün kapatılırken hata oluştu.");
        }
    };

    const handleUpdateQuest = async (updatedQuest) => {
        try {
            const payload = {
                id: updatedQuest.id,
                title: updatedQuest.title,
                description: updatedQuest.description,
                rewardPoints: Number(updatedQuest.rewardPoints || updatedQuest.points || 0), 
                category: updatedQuest.category,
                reminderDate: updatedQuest.reminderDate 
            };
            await api.put('/Quests', payload); 
            toast.success("Görev güncellendi! ✨");
            setRefreshTrigger(p => p + 1); 
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Güncelleme başarısız.");
        }
    };

    const handleToggleQuest = async (id) => {
        if (isFuture) { toast.warning("Acele etme! Bu görev yarına ait. ⏳"); return; }
        
        const quest = dashboardData?.todayQuests?.find(q => q.id === id);
        if (quest && !quest.isCompleted) {
             const currentPoints = Number(dashboardData.pointsEarnedToday || 0);
             const HARD_LIMIT = 200; // Sadece tamamlama işleminde geçerli 200 puanlık tavan
             const questPoints = Number(quest.rewardPoints || 0);

             if (currentPoints + questPoints > HARD_LIMIT) {
                 toast.warning("Günlük 200 puan limitini aşamazsınız");
                 return;
             }
        }

        try {
            const res = await api.post(`/Quests/toggle/${id}`);
            if(res.data) {
                if(!res.data.isSuccess) { toast.warning(res.data.message); return; }
                if (res.data.isCompleted) {
                    toast.success(`Görev tamamlandı! ✨`);
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                } else {
                    toast.info("Geri alındı. ↩️");
                }
                setRefreshTrigger(p => p + 1);
            }
        } catch (error) {
            console.error("Toggle error:", error);
            toast.error("İşlem sırasında hata oluştu.");
        }
    };

    const handlePinQuest = async (id) => {
        try {
            const res = await api.post(`/Quests/pin/${id}`);
            toast.info(res.data.message || "İşlem başarılı"); 
            setRefreshTrigger(p => p + 1); 
        } catch (error) {
            console.error(error);
            toast.error("Pinleme işlemi başarısız.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-primary animate-pulse bg-gray-50">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="relative pb-20">
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

                {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} onComplete={handleTutorialComplete} />}
                {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
                
                <UserGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />

                {/* 🌟 PREMIUM HEADER */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 shadow-sm transition-all duration-300">
                    <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
                        <div className="flex flex-col">
                            <img src="/Logo_Fox_BF.png" alt="Logo" className="w-28 h-auto object-contain mb-0.5" />
                            <div className="flex items-center gap-1.5 pl-1">
                                <span className={`w-2 h-2 rounded-full ${isToday ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`}></span>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                    {isToday ? "BUGÜN" : format(selectedDate, 'd MMMM', { locale: tr })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Link to="/admin" className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                    🛠️
                                </Link>
                            )}
                            
                            <button 
                                onClick={() => setShowGuideModal(true)} 
                                className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            >
                                <HelpCircle size={18} className="stroke-[2.5px]" />
                            </button>

                            <button onClick={() => setShowFeedback(true)} className="w-8 h-8 flex items-center justify-center bg-purple-50 text-purple-500 rounded-full hover:bg-purple-500 hover:text-white transition-all shadow-sm">
                                📣
                            </button>

                            {isToday && (
                                <button 
                                    onClick={() => setIsDayEndModalOpen(true)} 
                                    className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-gray-700 transition shadow-lg flex items-center gap-1.5 ml-1"
                                >
                                    <span>🌙</span> Bitir
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-6 animate-fade-in-up space-y-6">
                    {/* 📜 GÜNLÜK SÖZ - YENİ TASARIM */}
                    {isToday && (
                        <div className="transform hover:scale-[1.01] transition-transform duration-300">
                            <DailyQuote />
                        </div>
                    )}

                    {/* 📊 İSTATİSTİKLER - HUD TARZI */}
                    {isToday ? (
                        <div className="grid grid-cols-2 gap-3">
                            {/* Puan Kartı */}
                            <div className="bg-gradient-to-br from-white to-blue-50 p-1 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full -mr-8 -mt-8 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="bg-white rounded-xl p-3 h-full flex flex-col items-center justify-center text-center relative z-10">
                                    <div className="text-2xl mb-1">🎯</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-0.5">Günlük Puan</div>
                                    <div className="text-lg font-black text-blue-600">
                                        {dashboardData?.pointsEarnedToday} <span className="text-gray-300 text-sm">/ {dashboardData?.dailyTarget || 200}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min((dashboardData?.pointsEarnedToday / (dashboardData?.dailyTarget || 200)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Seri Kartı */}
                            <div className="bg-gradient-to-br from-white to-orange-50 p-1 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-full -mr-8 -mt-8 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                                <div className="bg-white rounded-xl p-3 h-full flex flex-col items-center justify-center text-center relative z-10">
                                    <div className="text-2xl mb-1">🔥</div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-0.5">Seri</div>
                                    <div className="text-lg font-black text-orange-500">{dashboardData?.currentStreak} Gün</div>
                                    {dashboardData?.streakStatusMessage && (
                                        <div className={`mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                            dashboardData.consecutiveMissedDays > 0 
                                                ? 'bg-red-50 text-red-500 animate-pulse' 
                                                : 'bg-green-50 text-green-600'
                                        }`}>
                                            {dashboardData.streakStatusMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl text-center shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                            <Calendar size={32} className="mx-auto text-blue-400 mb-2 opacity-80" />
                            <h3 className="text-blue-900 font-bold text-lg">Geleceği Planlıyorsun</h3>
                            <p className="text-xs text-blue-600 mt-1 font-medium">Yarına şimdiden hazırlanmak zaferin yarısıdır! 🚀</p>
                        </div>
                    )}
                    
                    {/* 🗓️ TARİH GEZGİNİ - KAPSÜL TASARIM */}
                    <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm relative z-10">
                        <button onClick={handlePrevDay} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500 hover:text-primary hover:bg-blue-50 transition-all active:scale-95">
                            <ChevronLeft size={20} strokeWidth={3} />
                        </button>
                        
                        <div className="flex flex-col items-center cursor-pointer group" onClick={handleGoToday}>
                            <span className={`text-sm font-black tracking-wide transition-colors ${isToday ? 'text-primary' : 'text-gray-600 group-hover:text-primary'}`}>
                                {isToday ? 'BUGÜN' : format(selectedDate, 'EEEE', { locale: tr }).toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md mt-0.5 group-hover:bg-gray-200 transition-colors">
                                {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
                            </span>
                        </div>
                        
                        <button onClick={handleNextDay} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-500 hover:text-primary hover:bg-blue-50 transition-all active:scale-95">
                            <ChevronRight size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* 📌 SIK KULLANILANLAR - POWER-UPS */}
                    {pinnedTemplates && pinnedTemplates.length > 0 && (
                        <div className="animate-fade-in">
                            <h3 className="flex items-center gap-1 text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                                <Star size={12} className="text-yellow-400 fill-current" /> Sık Kullanılanlar
                            </h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
                                {pinnedTemplates.map((template) => (
                                    <div key={template.id} 
                                        onClick={(e) => { e.stopPropagation(); handleAddFromTemplate(template); }}
                                        className="min-w-[150px] bg-white p-3 rounded-2xl border-2 border-transparent hover:border-blue-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer snap-start"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-50"></div>
                                        
                                        {/* Renkli Çizgi */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: template.colorCode || '#3498db' }}></div>

                                        <div className="relative z-10 pl-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm" style={{backgroundColor: `${template.colorCode || '#3498db'}15`, color: template.colorCode || '#3498db'}}>
                                                    {template.title.charAt(0).toUpperCase()}
                                                </div>
                                                <button 
                                                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                                                    onClick={(e) => { e.stopPropagation(); if(confirm("Kaldırılsın mı?")) handlePinQuest(template.id); }} 
                                                >
                                                    <span className="text-xs">✕</span>
                                                </button>
                                            </div>
                                            
                                            <h4 className="font-bold text-gray-700 text-sm truncate mb-1 pr-1">{template.title}</h4>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">+{template.rewardPoints} XP</span>
                                                <span className="text-[10px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                                    EKLE <span className="text-xs">→</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 📝 GÖREV LİSTESİ BAŞLIĞI */}
                    <div className="flex items-end justify-between border-b border-gray-100 pb-2">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">{isToday ? "⚡" : "📅"}</span> 
                            {isToday ? "Bugünün Görevleri" : "Planlanan Görevler"}
                        </h2>
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                            {dashboardData?.todayQuests?.length || 0} / 50
                        </span>
                    </div>
                    
                    {/* ➕ GÖREV EKLEME FORMU */}
                    <AddQuestForm onAdd={handleAddQuest} />

                    {/* 📋 LİSTE */}
                    <div className="space-y-3 mt-4 pb-12">
                        {(!dashboardData?.todayQuests || dashboardData.todayQuests.length === 0) ? (
                            <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center gap-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
                                <div className="absolute inset-0 bg-gray-50/50 pattern-grid-lg opacity-20 pointer-events-none"></div>
                                <div className="relative z-10 bg-white p-4 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <img src="/Sad_Fox_BF.png" alt="Waiting Fox" className="w-24 h-24 object-contain opacity-80" />
                                </div>
                                <div className="relative z-10">
                                    <p className="font-black text-gray-700 text-lg mb-1">{isToday ? "Liste Bomboş!" : "Plan Yok"}</p>
                                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                                        {isToday ? "Hadi, kahramanlık hikayeni yazmaya başla." : "Bu tarih için henüz bir macera planlamadın."}
                                    </p>
                                </div>
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
                                    disabled={false} 
                                />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </Layout>
    );
}