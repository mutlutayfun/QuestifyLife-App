import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";

const AddQuestForm = ({ onAdd, disabled }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(""); 
    const [points, setPoints] = useState(10);
    const [category, setCategory] = useState(""); 
    const [isOpen, setIsOpen] = useState(false);

    // YENİ: Hatırlatıcı State'leri
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderTime, setReminderTime] = useState("");

    // Sticker ve Görselleştirme Seçenekleri
    const POINT_OPTIONS = [
        { value: 5,  label: "Çerez",   emoji: "🍪", color: "hover:bg-green-50 hover:border-green-200 hover:text-green-600" },
        { value: 10, label: "Basit",   emoji: "🌱", color: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600" },
        { value: 15, label: "Normal",  emoji: "⚡", color: "hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600" },
        { value: 20, label: "Zor",     emoji: "🔥", color: "hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600" },
        { value: 25, label: "Çetin",   emoji: "💣", color: "hover:bg-red-50 hover:border-red-200 hover:text-red-600" },
        { value: 30, label: "Efsane",  emoji: "👑", color: "hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600" }
    ];

    useEffect(() => {
        // Form yüklendiğinde bildirim izni iste
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validasyon: Başlık ve Kategori zorunlu
        if (!title.trim() || !category.trim()) {
            toast.warning("Lütfen görev adı ve kategori giriniz.");
            return;
        }

        // Hatırlatıcı tarihi oluşturma
        let reminderDateISO = null;
        if (hasReminder && reminderTime) {
            const today = new Date();
            const [hours, minutes] = reminderTime.split(':');
            const reminderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
            reminderDateISO = reminderDate.toISOString();
        }

        onAdd({
            title: title,
            description: description,
            rewardPoints: parseInt(points),
            scheduledDate: new Date().toISOString(),
            category: category, 
            colorCode: "#3498db", // Varsayılan mavi renk
            reminderDate: reminderDateISO // YENİ: Hatırlatıcı zamanı
        });

        // Formu temizle
        setTitle("");
        setDescription("");
        setPoints(10);
        setCategory("");
        setHasReminder(false);
        setReminderTime("");
        setIsOpen(false);
    };

    if (disabled) {
        return (
            <div className="w-full py-4 bg-gray-100 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-60">
                <span>🚫</span> Gün Kapandı - Yeni Görev Eklenemez
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group bg-white hover:shadow-sm"
            >
                <span className="bg-blue-50 text-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform">+</span> 
                <span>Yeni Macera Ekle</span>
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up relative overflow-hidden">
             {/* Dekoratif Arka Plan */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

            {/* Görev Başlığı (Zorunlu) */}
            <div className="mb-4 relative z-10">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Görev Başlığı <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-gray-700 placeholder-gray-300 transition-all shadow-sm"
                    placeholder="Örn: 20 dk meditasyon"
                    required
                    autoFocus
                />
            </div>

            {/* Açıklama (Opsiyonel) */}
            <div className="mb-4 relative z-10">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Açıklama</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm h-20 resize-none text-gray-600 placeholder-gray-300 transition-all shadow-sm"
                    placeholder="Detaylar..."
                />
            </div>
            
            {/* Puan Seçimi - Sticker Style */}
            <div className="mb-5 relative z-10">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Zorluk Seviyesi</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {POINT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPoints(opt.value)}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200
                                ${points === opt.value 
                                    ? 'border-orange-400 bg-orange-50 text-orange-600 scale-105 shadow-md z-10 ring-2 ring-orange-200 ring-offset-1' 
                                    : `border-gray-50 bg-gray-50/50 text-gray-400 opacity-80 hover:opacity-100 hover:scale-105 ${opt.color}`
                                }
                            `}
                        >
                            <span className="text-xl mb-1 filter drop-shadow-sm">{opt.emoji}</span>
                            <span className="text-[9px] font-black uppercase tracking-wide">{opt.label}</span>
                            <div className={`absolute -top-1.5 -right-1.5 bg-white border shadow-sm rounded-full px-1.5 py-0.5 flex items-center
                                 ${points === opt.value ? 'border-orange-200 text-orange-500' : 'border-gray-100 text-gray-300'}
                            `}>
                                <span className="text-[8px] font-bold">+{opt.value}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 mb-5 relative z-10">
                {/* Kategori Girişi */}
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5 ml-1">Kategori <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold text-gray-700 placeholder-gray-300 transition-all shadow-sm"
                        placeholder="Spor, İş..."
                        required
                    />
                </div>

                {/* Hatırlatıcı Bölümü */}
                <div className="w-1/3">
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

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-50 relative z-10">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors hover:bg-gray-50 rounded-xl">İptal</button>
                <button type="submit" className="px-8 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <span>🚀</span> Başla
                </button>
            </div>
        </form>
    );
};

export default AddQuestForm;