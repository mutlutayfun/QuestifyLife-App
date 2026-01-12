import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale'; 
import api from '../api/axiosConfig';
import Layout from '../components/Layout';
import 'react-calendar/dist/Calendar.css'; 

export default function History() {
    const [date, setDate] = useState(new Date()); 
    const [calendarData, setCalendarData] = useState([]); 
    const [loading, setLoading] = useState(false);
    
    // Seçili güne ait veriyi bul
    const selectedDayData = calendarData.find(d => 
        new Date(d.date).toDateString() === date.toDateString()
    );

    // Tarih değiştiğinde veriyi çek
    useEffect(() => {
        fetchCalendarData(date.getFullYear(), date.getMonth() + 1);
    }, [date.getMonth()]); 

    const fetchCalendarData = async (year, month) => {
        setLoading(true);
        try {
            const res = await api.get(`/Performance/calendar?year=${year}&month=${month}`);
            setCalendarData(res.data);
        } catch (err) {
            console.error("Takvim verisi çekilemedi", err);
        } finally {
            setLoading(false);
        }
    };

    // Takvim hücrelerini boyama
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayData = calendarData.find(d => 
                new Date(d.date).toDateString() === date.toDateString()
            );

            if (dayData) {
                return (
                    <div className="mt-1 flex justify-center">
                        <div className={`w-2 h-2 rounded-full ${dayData.targetReached ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                );
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto p-4">
                <h1 className="text-2xl font-black text-gray-800 mb-4 tracking-tight">Geçmiş</h1>

                {loading && <div className="text-center mb-4 text-primary font-bold text-xs animate-pulse">VERİLER YÜKLENİYOR...</div>}

                {/* Takvim Bileşeni */}
                <div className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Calendar 
                        onChange={setDate} 
                        value={date}
                        locale="tr-TR"
                        tileContent={tileContent}
                        onActiveStartDateChange={({ activeStartDate }) => setDate(activeStartDate)}
                        className="rounded-xl border-none font-bold text-sm w-full"
                    />
                    
                    <div className="flex justify-center gap-4 mt-4 text-[10px] font-bold uppercase text-gray-400">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Hedef Tutuldu</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span>Hedef Kaçtı</span>
                        </div>
                    </div>
                </div>

                {/* Gün Detayları */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
                    <h3 className="font-black text-gray-800 border-b border-gray-100 pb-3 mb-4">
                        {format(date, 'd MMMM yyyy, EEEE', { locale: tr })}
                    </h3>

                    {selectedDayData ? (
                        <div className="space-y-4">
                            {/* Puan Özeti */}
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                                <span className="text-xs font-bold text-gray-500 uppercase">Kazanılan</span>
                                <span className="font-black text-primary text-xl">{selectedDayData.points} XP</span>
                            </div>
                            
                            {/* Gün Sonu Notu */}
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 relative overflow-hidden">
                                <p className="text-[10px] font-black text-yellow-600 uppercase mb-1">Günlük Not</p>
                                <p className="text-sm text-gray-700 italic relative z-10">
                                    "{selectedDayData.note || 'Bu gün için not alınmamış.'}"
                                </p>
                                <span className="absolute -bottom-2 -right-2 text-4xl opacity-20">📝</span>
                            </div>

                            {/* Tamamlanan Görevler Listesi */}
                            <div className="border-t border-gray-100 pt-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Tamamlanan Görevler</p>
                                
                                {selectedDayData.completedQuests && selectedDayData.completedQuests.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedDayData.completedQuests.map((quest, index) => {
                                            // Backend verisi "string" mi "obje" mi kontrolü
                                            const isObject = typeof quest === 'object' && quest !== null;
                                            
                                            // Verileri ayıkla
                                            const title = isObject ? quest.title : quest;
                                            const category = isObject ? quest.category : null;
                                            const points = isObject ? quest.rewardPoints : null;

                                            return (
                                                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        {/* Tik İkonu */}
                                                        <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold">✓</div>
                                                        
                                                        <div>
                                                            <span className="text-sm font-bold text-gray-700 block line-clamp-1">
                                                                {title}
                                                            </span>
                                                            
                                                            {/* Kategori Etiketi (Varsa Göster) */}
                                                            {category && (
                                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                                                    {category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Puan (Varsa Göster) */}
                                                    {points && (
                                                        <span className="text-xs font-black text-primary bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                                                            +{points}
                                                        </span>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-xs text-gray-400 italic">
                                            Bu gün tamamlanan görev detayı yok.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-300">
                            <span className="text-4xl block mb-2 opacity-50">📅</span>
                            <p className="font-bold text-sm">Bu tarih için kayıt bulunamadı.</p>
                            <p className="text-xs mt-1">Henüz bir macera yaşanmamış.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}