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
    }, [date.getMonth()]); // Ay değişince veriyi yenile

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

    // Takvim hücrelerini boyama (Nokta işaretleri)
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayData = calendarData.find(d => 
                new Date(d.date).toDateString() === date.toDateString()
            );

            if (dayData) {
                return (
                    <div className="flex justify-center mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${dayData.targetReached ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.6)]' : 'bg-red-400'}`}></div>
                    </div>
                );
            }
        }
    };

    return (
        <Layout>
            {/* Özel Takvim Stilleri */}
            <style>{`
                .react-calendar {
                    border: none;
                    background: transparent;
                    width: 100%;
                    font-family: inherit;
                }
                .react-calendar__navigation button {
                    font-weight: 800;
                    color: #4b5563;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                    background-color: #f3f4f6;
                    border-radius: 12px;
                }
                .react-calendar__month-view__weekdays {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #9ca3af;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                .react-calendar__month-view__days__day {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #374151;
                }
                .react-calendar__tile {
                    padding: 0.75em 0.5em;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                    background-color: #f5f3ff;
                    color: #7c3aed;
                }
                .react-calendar__tile--now {
                    background: #ede9fe !important;
                    color: #7c3aed !important;
                    font-weight: bold;
                }
                .react-calendar__tile--active {
                    background: #8b5cf6 !important;
                    color: white !important;
                    box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
                }
            `}</style>

            <div className="max-w-md mx-auto pb-24">
                {/* 🌟 HEADER - Violet Temalı */}
                <div className="relative mb-6">
                     <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-b-[2.5rem] shadow-lg overflow-hidden relative flex flex-col items-center justify-center text-center">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -translate-x-5 -translate-y-5 blur-xl"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-10 translate-y-10 blur-xl"></div>
                        
                        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md relative z-10 flex items-center gap-2">
                             <span>📅</span> Zaman Yolculuğu
                        </h1>
                        <p className="text-violet-100 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">Geçmiş Başarıların</p>
                    </div>
                </div>

                {/* Yükleniyor Göstergesi */}
                {loading && (
                    <div className="flex justify-center my-4">
                        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* TAKVİM KARTI */}
                <div className="mx-4 bg-white p-4 rounded-3xl shadow-lg shadow-violet-100 border border-white mb-6 relative z-10 -mt-8">
                    <Calendar 
                        onChange={setDate} 
                        value={date}
                        locale="tr-TR"
                        tileContent={tileContent}
                        onActiveStartDateChange={({ activeStartDate }) => setDate(activeStartDate)}
                        className="w-full"
                        formatShortWeekday={(locale, date) => ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'][date.getDay()]} // Türkçe kısa gün adları
                    />
                    
                    {/* Lejant */}
                    <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-50 text-[10px] font-bold uppercase text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.6)]"></div>
                            <span>Hedef Tamam</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span>Hedef Kaçtı</span>
                        </div>
                    </div>
                </div>

                {/* GÜN DETAYLARI */}
                <div className="px-4 animate-fade-in-up">
                    <h3 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2">
                        <span className="text-violet-500 text-xl">📌</span>
                        {format(date, 'd MMMM yyyy, EEEE', { locale: tr })}
                    </h3>

                    {selectedDayData ? (
                        <div className="space-y-4">
                            {/* İstatistik Kartı */}
                            <div className="bg-gradient-to-br from-white to-violet-50 p-5 rounded-2xl shadow-sm border border-violet-100 flex justify-between items-center relative overflow-hidden group">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-violet-100 rounded-full blur-2xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div>
                                    <p className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-1">Toplam Kazanım</p>
                                    <p className="font-black text-3xl text-gray-800">{selectedDayData.points} <span className="text-sm text-violet-500">XP</span></p>
                                </div>
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-2xl border border-violet-50">
                                    🏆
                                </div>
                            </div>
                            
                            {/* Günlük Not */}
                            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 relative">
                                <span className="absolute -top-3 -left-2 text-2xl rotate-12">📌</span>
                                <p className="text-[10px] font-black text-yellow-600 uppercase mb-2 tracking-wider">Günün Notu</p>
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                    "{selectedDayData.note || 'Bu gün için henüz bir not alınmamış.'}"
                                </p>
                            </div>

                            {/* Tamamlanan Görevler */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-gray-700">Tamamlanan Görevler</h4>
                                    <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                                        {selectedDayData.completedQuests?.length || 0}
                                    </span>
                                </div>
                                
                                <div className="p-2">
                                    {selectedDayData.completedQuests && selectedDayData.completedQuests.length > 0 ? (
                                        <ul className="space-y-1">
                                            {selectedDayData.completedQuests.map((quest, index) => {
                                                const isObject = typeof quest === 'object' && quest !== null;
                                                const title = isObject ? quest.title : quest;
                                                const category = isObject ? quest.category : null;
                                                const points = isObject ? quest.rewardPoints : null;

                                                return (
                                                    <li key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-all group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-xs border border-green-100 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                                                ✓
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-bold text-gray-700 block">{title}</span>
                                                                {category && (
                                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{category}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {points && (
                                                            <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
                                                                +{points} XP
                                                            </span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-gray-300 text-4xl mb-2">💤</p>
                                            <p className="text-xs text-gray-400">Bu tarihte tamamlanan görev yok.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                            <span className="text-5xl block mb-4 opacity-40 grayscale">🦕</span>
                            <p className="font-bold text-gray-500">Kayıt Bulunamadı</p>
                            <p className="text-xs text-gray-400 mt-1">Bu tarihte herhangi bir aktivite görünmüyor.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}