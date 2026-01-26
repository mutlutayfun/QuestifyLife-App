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
import { format, addDays, isSameDay } from 'date-fns'; 
import { tr } from 'date-fns/locale'; 
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react'; 

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
        new Notification(title, { body, icon: '/vite.svg' });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body, icon: '/vite.svg' });
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
    const [showGuideModal, setShowGuideModal] = useState(false); // Guide Modal State
    const [isAdmin, setIsAdmin] = useState(false);
    

    // YENİ: Bildirimi gönderilen görevlerin ID'lerini tutmak için
    const notifiedQuestsRef = useRef(new Set());

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ⏰ HATIRLATICI KONTROL MEKANİZMASI (GÜNCELLENDİ)
    useEffect(() => {
        // İzin iste (Sayfa yüklendiğinde)
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const checkReminders = () => {
            if (!dashboardData?.todayQuests) return;

            const now = new Date();
            
            dashboardData.todayQuests.forEach(quest => {
                // Sadece hatırlatıcısı olan, tamamlanmamış ve henüz bildirilmemiş görevlere bak
                if (quest.reminderDate && !quest.isCompleted && !notifiedQuestsRef.current.has(quest.id)) {
                    
                    const reminderTime = new Date(quest.reminderDate);
                    
                    // Farkı milisaniye cinsinden hesapla
                    const diff = reminderTime.getTime() - now.getTime();

                    // Debug için konsola yazdır (Geliştirme aşamasında faydalı)
                    // console.log(`Görev: ${quest.title}, Kalan Süre: ${diff}ms`);

                    // Eğer zamanı geldiyse (diff <= 0) 
                    // VE zamanın üzerinden çok geçmediyse (1 saat tolerans -3600000ms)
                    if (diff <= 0 && diff > -3600000) { 
                        // Bildirim Gönder
                        sendNotification("🔔 Görev Zamanı!", `${quest.title} görevini yapma zamanı geldi!`);
                        
                        // Bu görevi "bildirildi" olarak işaretle
                        notifiedQuestsRef.current.add(quest.id);
                        
                        // Opsiyonel: Ses efekti
                        // const audio = new Audio('/notification_sound.mp3'); 
                        // audio.play().catch(e => console.error("Ses çalınamadı:", e));
                    }
                }
            });
        };

        // Her 10 saniyede bir kontrol et (Daha sık kontrol daha hassas olur)
        const intervalId = setInterval(checkReminders, 10000);
        
        // İlk yüklemede de bir kez kontrol et
        checkReminders();

        return () => clearInterval(intervalId);
    }, [dashboardData]); // dashboardData değiştikçe listeyi yenile (yeni görev eklendiğinde vs.)

    // ... (Kalan kodlar AYNI) ...
    useEffect(() => {
        const checkAdminStatus = async () => {
             // Eğer user objesinde direkt varsa oradan al
             if (user?.isAdmin || user?.IsAdmin) {
                 setIsAdmin(true);
                 return;
             }
             
             try {
                 const res = await api.get('/User/profile');
                 const profile = res.data.data || res.data;
                 
                 // Backend'den gelen veriye göre admin durumunu set et
                 // Hem camelCase (isAdmin) hem PascalCase (IsAdmin) kontrolü yapıyoruz
                 // Böylece JSON serialization formatı ne olursa olsun çalışır
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
        // 1. Modalı kapat
        setShowTutorial(false);
        
        try {
            // 2. Backend'e güncelleme isteği at (Manifesto + Tutorial Görüldü)
            await api.put('/User/profile', { 
                hasSeenTutorial: true,
                personalManifesto: manifestoText
            });

            // 3. Context'i güncelle
            updateUser({ 
                hasSeenTutorial: true,
                personalManifesto: manifestoText
            });
            
            toast.success("Sözün kaydedildi kahraman! Maceraya hazırsın. 🚀");

        } catch (error) {
            console.error("Tutorial update error:", error);
            // Hata olsa bile context'i güncelle ki modal tekrar çıkmasın
            updateUser({ hasSeenTutorial: true });
        }
    };

    // VERİ ÇEKME
    useEffect(() => {
        const fetchData = async () => {
            try {
                const formattedDate = selectedDate.toISOString();
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
        try {
            const payload = { ...questData, scheduledDate: selectedDate.toISOString() };
            await api.post('/Quests', payload);
            setRefreshTrigger(prev => prev + 1);
            toast.success("Görev başarıyla eklendi! 🚀");
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Görev ekleme başarısız.";
            toast.error(errorMessage);
        }
    };
    
    const handleAddFromTemplate = async (template) => {
        if (isToday && dashboardData?.isDayClosed) {
            toast.warning("Bugün kapandı, yeni görev ekleyemezsin!");
            return;
        }
        const newQuestData = {
            title: template.title,
            description: template.description || "",
            rewardPoints: template.rewardPoints,
            category: template.category || "Genel",
            colorCode: template.colorCode || "#3498db",
            scheduledDate: selectedDate.toISOString()
        };
        try {
            await api.post('/Quests', newQuestData);
            setRefreshTrigger(prev => prev + 1);
            toast.success(`"${template.title}" listeye eklendi! 🚀`);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Şablondan ekleme başarısız.";
            toast.error(errorMessage);
        }
    };

    const handleDeleteQuest = async (id) => {
        if(!confirm("Bu görevi silmek istediğine emin misin?")) return;
        try {
            await api.delete(`/Quests/${id}`);
            setRefreshTrigger(prev => prev + 1);
            toast.info("Görev silindi.");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Silme işlemi başarısız.";
            toast.error(errorMessage);
        }
    };

    const handleFinishDay = async (note) => {
        try {
            const response = await api.post('/Performance/finish-day', { note });
            setIsDayEndModalOpen(false); 
            if (!response.data.isSuccess) { toast.warning(response.data.message); return; }
            toast.success(response.data.message); 
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
            if(response.data.newBadges && response.data.newBadges.length > 0) {
                toast.info(`🏅 Yeni Rozet: ${response.data.newBadges.join(", ")}`);
            }
            setRefreshTrigger(prev => prev + 1); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Gün kapatılırken hata oluştu.";
            toast.error(errorMessage);
        }
    };

    const handleUpdateQuest = async (updatedQuest) => {
        try {
            const payload = {
                id: updatedQuest.id,
                title: updatedQuest.title,
                description: updatedQuest.description,
                rewardPoints: updatedQuest.rewardPoints || updatedQuest.points, 
                category: updatedQuest.category,
                reminderDate: updatedQuest.reminderDate // Hatırlatıcı tarihini de gönderiyoruz
            };
            await api.put('/Quests', payload); 
            toast.success("Görev güncellendi! ✨");
            setRefreshTrigger(p => p + 1); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Güncelleme başarısız.";
            toast.error(errorMessage);
        }
    };

    const handleToggleQuest = async (id) => {
        if (isFuture) { toast.warning("Acele etme! Bu görev yarına ait. ⏳"); return; }
        try {
            const res = await api.post(`/Quests/toggle/${id}`);
            if(res.data) {
                if(!res.data.isSuccess && res.data.message) { toast.warning(res.data.message); return; }
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
        } catch (error) {
            const errorMessage = error.response?.data?.message || "İşlem sırasında hata oluştu.";
            toast.error(errorMessage);
        }
    };

    const handlePinQuest = async (id) => {
        try {
            const res = await api.post(`/Quests/pin/${id}`);
            toast.info(res.data.message || "İşlem başarılı"); 
            setRefreshTrigger(p => p + 1); 
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Pinleme işlemi başarısız.";
            toast.error(errorMessage);
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

                {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} onComplete={handleTutorialComplete} />}
                {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
                
                {/* User Guide Modal Eklendi */}
                <UserGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />

                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
                        <div>
                            <img src="/Logo_Fox_BF.png" alt="Logo" className="w-36 h-15 object-contain" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {isToday ? "Bugün" : format(selectedDate, 'd MMMM', { locale: tr })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* YENİ: Admin Butonu */}
                            {isAdmin && (
                                <Link to="/admin" className="text-xs bg-red-100 text-red-600 px-2 py-1.5 rounded-lg font-bold border border-red-200 hover:bg-red-200 transition flex items-center gap-1">
                                    <span>🛠️</span> <span className="hidden sm:inline">Admin</span>
                                </Link>
                            )}
                            <span className="text-sm text-gray-600 font-medium">{user?.username}</span>
                            
                            {/* Nasıl Oynanır Butonu - GÜNCELLENMİŞ TASARIM */}
                            <button 
                                onClick={() => setShowGuideModal(true)} 
                                className="group relative flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110 active:scale-95" 
                                title="Nasıl Oynanır?"
                            >
                                <HelpCircle size={20} className="stroke-[2.5px]" />
                                {/* Hafif pulse efekti */}
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                            </button>

                            <button onClick={() => setShowFeedback(true)} className="text-gray-400 hover:text-primary transition" title="Geri Bildirim">📣</button>
                            {isToday && (
                                <button onClick={() => setIsDayEndModalOpen(true)} className="bg-dark text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-gray-800 transition shadow-sm flex items-center gap-1"><span>🌙</span> Bitir</button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-6 animate-fade-in-up space-y-6">
                    {isToday && <DailyQuote />}
                    {isToday ? (
                        <div className="grid grid-cols-2 gap-3">
                            <StatsCard title="Günlük Puan" value={`${dashboardData?.pointsEarnedToday} / ${dashboardData?.dailyTarget}`} icon="🎯" color="border-primary" />
                            <StatsCard title="Seri (Gün)" value={dashboardData?.currentStreak} icon="🔥" color="border-secondary" />
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                            <h3 className="text-blue-800 font-bold">📅 Planlama Modu</h3>
                            <p className="text-xs text-blue-600">Yarını şimdiden planlayarak güne önde başla!</p>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button onClick={handlePrevDay} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-500 hover:text-primary transition">◀</button>
                        <div className="flex flex-col items-center cursor-pointer" onClick={handleGoToday}>
                            <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-600'}`}>{isToday ? 'BUGÜN' : format(selectedDate, 'EEEE', { locale: tr })}</span>
                            <span className="text-xs text-gray-400">{format(selectedDate, 'd MMMM yyyy', { locale: tr })}</span>
                        </div>
                        <button onClick={handleNextDay} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-500 hover:text-primary transition">▶</button>
                    </div>

                    {pinnedTemplates && pinnedTemplates.length > 0 && (
                        <div className="animate-fade-in">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">📌 Sık Kullanılanlar</h3>
                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {pinnedTemplates.map((template) => (
                                    <div key={template.id} className="min-w-[140px] bg-white p-3 rounded-2xl border border-gray-100 shadow-sm snap-start hover:shadow-md transition-all cursor-pointer group relative overflow-hidden" onClick={() => handleAddFromTemplate(template)}>
                                        <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-100 transition-opacity"><span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md font-bold">+ Ekle</span></div>
                                        <button className="absolute top-0 left-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => { e.stopPropagation(); if(confirm("Bu şablonu sık kullanılanlardan kaldırmak istediğine emin misin?")) handlePinQuest(template.id); }} title="Sık kullanılanlardan kaldır">
                                            <span className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-md font-bold hover:bg-red-100 hover:text-red-600 transition-colors">Kaldır</span>
                                        </button>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2" style={{backgroundColor: `${template.colorCode || '#3498db'}20`, color: template.colorCode || '#3498db'}}>{template.title.charAt(0).toUpperCase()}</div>
                                        <h4 className="font-bold text-gray-700 text-sm truncate mb-1">{template.title}</h4>
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">+{template.rewardPoints} XP</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span>⚡</span> {isToday ? "Bugünün Görevleri" : "Planlanan Görevler"}</h2>
                    
                    <AddQuestForm onAdd={handleAddQuest} disabled={isToday && dashboardData?.isDayClosed} />

                    <div className="space-y-2 mt-4">
                        {(!dashboardData?.todayQuests || dashboardData.todayQuests.length === 0) ? (
                            <div className="text-center py-10 px-6 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center gap-4">
                                {/* BOŞ DURUM GÖRSELİ */}
                                <img src="/Sad_Fox_BF.png" alt="Waiting Fox" className="w-32 h-32 object-contain opacity-80" />
                                <div>
                                    <p className="font-bold text-gray-600">{isToday ? "Henüz bir macera eklemedin!" : "Bu tarih için planlanmış görev yok."}</p>
                                    <p className="text-sm">Hadi, ilk görevini oluşturarak başla.</p>
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
                                    disabled={isFuture} 
                                />
                            ))
                        )}
                    </div>
                </main>
            </div>
        </Layout>
    );
}