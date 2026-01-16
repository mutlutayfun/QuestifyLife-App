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

  const POINT_OPTIONS = [5, 10, 15, 20, 25, 30];

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
          className="w-full p-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          className="w-full p-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm h-16 resize-none"
          placeholder="Detay eklemek istersen..."
        />
      </div>
      
      {/* Puan Seçimi */}
      <div className="mb-4">
        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Ödül Puanı (XP)</label>
        <div className="flex justify-between gap-1">
            {POINT_OPTIONS.map((opt) => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => setPoints(opt)}
                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all border-2
                        ${points === opt 
                            ? 'border-orange-400 bg-orange-50 text-orange-500 scale-105 shadow-sm' 
                            : 'border-gray-100 bg-white text-gray-400 hover:border-orange-200'}
                    `}
                >
                    +{opt}
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
                className="w-full p-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Örn: Spor, İş..."
                required
            />
        </div>

        {/* YENİ: Hatırlatıcı Bölümü */}
        <div className="w-1/3">
             <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Hatırlatıcı</label>
             <div className="flex items-center gap-2 h-[42px]"> {/* h-[42px] input yüksekliğiyle eşitlemek için */}
                <button
                    type="button"
                    onClick={() => setHasReminder(!hasReminder)}
                    className={`h-full aspect-square rounded-lg border transition-colors flex items-center justify-center ${hasReminder ? 'bg-orange-100 border-orange-200 text-orange-500' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-orange-200'}`}
                    title="Hatırlatıcı Ekle"
                >
                    🔔
                </button>
                
                {hasReminder && (
                    <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="h-full w-full p-1 text-sm font-bold bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-300 text-gray-700"
                        required={hasReminder}
                    />
                )}
             </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors">İptal</button>
        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-blue-600 transition-colors">Ekle</button>
      </div>
    </form>
  );
};

export default AddQuestForm;