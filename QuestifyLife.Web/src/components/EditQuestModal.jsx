import React, { useState, useEffect } from 'react';

const EditQuestModal = ({ isOpen, onClose, onUpdate, quest }) => {
    // State Tanımları
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [rewardPoints, setRewardPoints] = useState(10);
    const [category, setCategory] = useState("");
    
    // Hatırlatıcı State'leri
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderTime, setReminderTime] = useState("");

    // Sticker Seçenekleri
    const POINT_OPTIONS = [
        { value: 5,  label: "Çerez",   emoji: "🍪", color: "hover:bg-green-50 hover:border-green-200 hover:text-green-600" },
        { value: 10, label: "Basit",   emoji: "🌱", color: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600" },
        { value: 15, label: "Normal",  emoji: "⚡", color: "hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600" },
        { value: 20, label: "Zor",     emoji: "🔥", color: "hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600" },
        { value: 25, label: "Çetin",   emoji: "💣", color: "hover:bg-red-50 hover:border-red-200 hover:text-red-600" },
        { value: 30, label: "Efsane",  emoji: "👑", color: "hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600" }
    ];

    // Modal açıldığında verileri doldur
    useEffect(() => {
        if (isOpen && quest) {
            setTitle(quest.title || "");
            setDescription(quest.description || "");
            setRewardPoints(quest.rewardPoints || quest.points || 10);
            setCategory(quest.category || "Genel");

            // Hatırlatıcı kontrolü
            if (quest.reminderDate) {
                setHasReminder(true);
                const date = new Date(quest.reminderDate);
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                setReminderTime(`${hours}:${minutes}`);
            } else {
                setHasReminder(false);
                setReminderTime("");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, quest]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Hatırlatıcı tarihi oluşturma
        let reminderDateISO = null;
        if (hasReminder && reminderTime) {
            const baseDate = quest.scheduledDate ? new Date(quest.scheduledDate) : new Date();
            const [hours, minutes] = reminderTime.split(':');
            baseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            reminderDateISO = baseDate.toISOString();
        }

        // Güncellenmiş veriyi gönder
        onUpdate({
            ...quest,
            title,
            description,
            rewardPoints,
            category,
            reminderDate: reminderDateISO
        });
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up border border-gray-100 relative overflow-hidden">
                
                {/* Arka plan dekoru */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50 blur-xl pointer-events-none"></div>

                <div className="flex justify-between items-center mb-5 relative z-10 border-b border-gray-100 pb-3">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <span>✏️</span> Görevi Düzenle
                    </h3>
                    <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
                        ✕
                    </button>
                </div>
                
                <div className="space-y-4 relative z-10">
                    {/* Başlık */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Başlık</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-700 transition-all shadow-sm"
                            required 
                        />
                    </div>

                    {/* Açıklama */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Açıklama</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none h-20 resize-none text-sm text-gray-600 transition-all shadow-sm"
                        />
                    </div>

                    {/* Puan Seçimi */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Zorluk Seviyesi</label>
                        <div className="grid grid-cols-3 gap-2">
                            {POINT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setRewardPoints(opt.value)}
                                    className={`relative flex items-center justify-center gap-2 py-2 px-1 rounded-xl border-2 transition-all duration-200
                                        ${rewardPoints === opt.value 
                                            ? 'border-orange-400 bg-orange-50 text-orange-600 scale-105 shadow-md z-10 ring-1 ring-orange-200' 
                                            : `border-gray-50 bg-gray-50 text-gray-400 opacity-90 hover:opacity-100 hover:scale-105 ${opt.color}`
                                        }
                                    `}
                                >
                                    <span className="text-lg">{opt.emoji}</span>
                                    <span className="text-[10px] font-black uppercase">{opt.label}</span>
                                    {rewardPoints === opt.value && (
                                        <div className="absolute -top-2 -right-1 bg-orange-500 text-white text-[8px] font-bold px-1.5 rounded-full shadow-sm">
                                            ✓
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kategori ve Hatırlatıcı */}
                    <div className="flex gap-3 pt-2">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Kategori</label>
                            <input 
                                type="text"
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-gray-700 shadow-sm"
                            />
                        </div>

                        <div className="w-[40%]">
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Hatırlatıcı</label>
                            <div className="flex items-center gap-2 h-[46px]">
                                <button
                                    type="button"
                                    onClick={() => setHasReminder(!hasReminder)}
                                    className={`h-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center shadow-sm
                                        ${hasReminder 
                                            ? 'bg-orange-100 border-orange-200 text-orange-500 animate-pulse' 
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-orange-200 hover:text-orange-400'}`}
                                    title="Hatırlatıcı Ekle"
                                >
                                    🔔
                                </button>
                                
                                {hasReminder && (
                                    <input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="h-full w-full p-1 text-xs font-bold bg-white border-2 border-orange-100 rounded-xl outline-none focus:border-orange-300 text-gray-700 text-center shadow-sm"
                                        required={hasReminder}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-50">
                    <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">İptal</button>
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                        <span>💾</span> Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditQuestModal;