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
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
            >
                <span>+</span> Yeni Macera Ekle
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-lg border border-blue-50 animate-fade-in-up">
            {/* Görev Başlığı (Zorunlu) */}
            <div className="mb-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Görev Başlığı <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-gray-700"
                    placeholder="Örn: 20 dk meditasyon"
                    required
                    autoFocus
                />
            </div>

            {/* Açıklama (Opsiyonel) */}
            <div className="mb-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Açıklama (İsteğe Bağlı)</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm h-16 resize-none text-gray-600"
                    placeholder="Detay eklemek istersen..."
                />
            </div>
            
            {/* Puan Seçimi - Sticker Style */}
            <div className="mb-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Zorluk Seviyesi (XP)</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {POINT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPoints(opt.value)}
                            className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200
                                ${points === opt.value 
                                    ? 'border-orange-400 bg-orange-50 text-orange-600 scale-105 shadow-md z-10' 
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

            <div className="flex gap-3 mb-4">
                {/* Kategori Girişi */}
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Kategori <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        placeholder="Örn: Spor, İş..."
                        required
                    />
                </div>

                {/* Hatırlatıcı Bölümü */}
                <div className="w-1/3">
                     <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Hatırlatıcı</label>
                     <div className="flex items-center gap-2 h-[38px]">
                        <button
                            type="button"
                            onClick={() => setHasReminder(!hasReminder)}
                            className={`h-full aspect-square rounded-lg border transition-colors flex items-center justify-center 
                                ${hasReminder 
                                    ? 'bg-orange-100 border-orange-200 text-orange-500 animate-pulse' 
                                    : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-orange-200 hover:text-orange-400'}`}
                            title="Hatırlatıcı Ekle"
                        >
                            🔔
                        </button>
                        
                        {hasReminder && (
                            <input
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="h-full w-full p-1 text-xs font-bold bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-300 text-gray-700 text-center"
                                required={hasReminder}
                            />
                        )}
                     </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors">İptal</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <span>🚀</span> Başla
                </button>
            </div>
        </form>
    );
};

export default AddQuestForm;