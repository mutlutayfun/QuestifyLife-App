import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale'; // Türkçe tarih formatı için
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import 'react-calendar/dist/Calendar.css'; // Temel stiller

export default function History() {
    const [date, setDate] = useState(new Date()); // Seçili gün
    const [calendarData, setCalendarData] = useState([]); // API verisi
    const [loading, setLoading] = useState(false);
    
    // Seçili günün verisi
    const selectedDayData = calendarData.find(d => 
        new Date(d.date).toDateString() === date.toDateString()
    );

    // Ay değiştiğinde veya sayfa açıldığında veri çek
    useEffect(() => {
        fetchCalendarData(date.getFullYear(), date.getMonth() + 1);
    }, [date.getMonth()]); // Sadece ay değişince çalışsın

    const fetchCalendarData = async (year, month) => {
        setLoading(true);
        try {
            // Backend endpoint: /Performance/calendar?year=2024&month=10
            const res = await api.get(`/Performance/calendar?year=${year}&month=${month}`);
            setCalendarData(res.data);
        } catch (err) {
            console.error("Takvim verisi çekilemedi", err);
        } finally {
            setLoading(false);
        }
    };

    // Takvimdeki kutucukları boyama fonksiyonu
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            // Bu tarihe ait veri var mı?
            const dayData = calendarData.find(d => 
                new Date(d.date).toDateString() === date.toDateString()
            );

            if (dayData) {
                return (
                    <div className="mt-1 flex justify-center">
                        <div className={`w-2 h-2 rounded-full ${dayData.targetReached ? 'bg-secondary' : 'bg-danger'}`}></div>
                    </div>
                );
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Geçmiş</h1>

                {/* loading değişkenini kullanarak hatayı çözdük */}
                {loading && <div className="text-center mb-4 text-primary font-medium">Veriler yükleniyor...</div>}

                {/* Takvim Bileşeni */}
                <div className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Calendar 
                        onChange={setDate} 
                        value={date}
                        locale="tr-TR"
                        tileContent={tileContent}
                        onActiveStartDateChange={({ activeStartDate }) => setDate(activeStartDate)} // Ay değiştirince state'i güncelle
                    />
                    
                    {/* Lejant (Açıklama) */}
                    <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-secondary"></div>
                            <span>Hedef Başarılı</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-danger"></div>
                            <span>Başarısız</span>
                        </div>
                    </div>
                </div>

                {/* Seçili Gün Detayı */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">
                        {format(date, 'd MMMM yyyy, EEEE', { locale: tr })}
                    </h3>

                    {selectedDayData ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Kazanılan Puan:</span>
                                <span className="font-bold text-primary text-lg">{selectedDayData.points} XP</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Durum:</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${selectedDayData.targetReached ? 'bg-secondary' : 'bg-danger'}`}>
                                    {selectedDayData.targetReached ? 'HEDEF TUTTU 🎉' : 'HEDEF KAÇTI 😞'}
                                </span>
                            </div>

                            {/* Gün Sonu Notu */}
                            <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                <p className="text-xs font-bold text-yellow-600 uppercase mb-1">Günlük Not</p>
                                <p className="text-sm text-gray-700 italic">
                                    "{selectedDayData.note || 'Bu gün için not alınmamış.'}"
                                </p>
                            </div>

                            {/* Tamamlanan Görevler Listesi (YENİ EKLENEN KISIM) */}
                            <div className="mt-4 border-t pt-3">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Tamamlanan Görevler</p>
                                {selectedDayData.completedQuests && selectedDayData.completedQuests.length > 0 ? (
                                    <ul className="space-y-1">
                                        {selectedDayData.completedQuests.map((questTitle, index) => (
                                            <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="text-secondary text-xs">✓</span>
                                                {questTitle}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">
                                        {/* Backend liste göndermezse count'a bakıp genel mesaj verelim */}
                                        {selectedDayData.completedQuestCount > 0 
                                            ? `${selectedDayData.completedQuestCount} görev tamamlandı (Detay yok).` 
                                            : "Bu gün tamamlanan görev kaydı yok."}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <p>Bu tarih için kayıt bulunamadı.</p>
                            <span className="text-3xl block mt-2">📅</span>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
