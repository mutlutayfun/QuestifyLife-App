import React, { useState, useEffect } from 'react';

const EditQuestModal = ({ isOpen, onClose, onUpdate, quest }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        rewardPoints: 10,
        category: ""
    });

    // YENİ: Hatırlatıcı State'leri
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderTime, setReminderTime] = useState("");
    
    // Puan seçenekleri
    const POINT_OPTIONS = [5, 10, 15, 20, 25, 30];

    useEffect(() => {
        if (quest) {
            setFormData({
                title: quest.title || "",
                description: quest.description || "",
                rewardPoints: quest.rewardPoints || quest.points || 10,
                category: quest.category || "Diğer"
            });

            // YENİ: Mevcut hatırlatıcı varsa state'i doldur
            if (quest.reminderDate) {
                setHasReminder(true);
                const date = new Date(quest.reminderDate);
                // Saati ve dakikayı al (HH:mm formatı için)
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                setReminderTime(`${hours}:${minutes}`);
            } else {
                setHasReminder(false);
                setReminderTime("");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quest]); 

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // YENİ: Hatırlatıcı tarihi oluşturma mantığı
        let reminderDateISO = null;
        if (hasReminder && reminderTime) {
            // Görevin planlanan tarihini baz al, yoksa bugünü kullan
            const baseDate = quest.scheduledDate ? new Date(quest.scheduledDate) : new Date();
            const [hours, minutes] = reminderTime.split(':');
            
            // Seçilen saati ayarla
            baseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            reminderDateISO = baseDate.toISOString();
        }

        // Form verilerini ve hatırlatıcıyı üst bileşene gönder
        onUpdate({ 
            ...quest, 
            ...formData,
            reminderDate: reminderDateISO 
        }); 
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up">
                <h3 className="text-lg font-black text-gray-800 mb-4 border-b pb-2">Görevi Düzenle</h3>
                
                <div className="space-y-4">
                    {/* Başlık */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Başlık</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:border-primary outline-none text-sm font-medium"
                            required 
                        />
                    </div>

                    {/* Açıklama */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Açıklama</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:border-primary outline-none h-20 resize-none text-sm"
                        />
                    </div>

                    {/* Puan Seçimi (Butonlu Yapı) */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Puan</label>
                        <div className="flex justify-between gap-1">
                            {POINT_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setFormData({...formData, rewardPoints: opt})}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-black transition-all border
                                        ${formData.rewardPoints === opt 
                                            ? 'border-orange-400 bg-orange-50 text-orange-500 shadow-sm' 
                                            : 'border-gray-100 bg-white text-gray-400 hover:border-orange-200'}
                                    `}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Kategori ve Hatırlatıcı Yan Yana */}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori</label>
                            <input 
                                type="text"
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full p-2 border rounded-lg focus:border-primary outline-none text-sm"
                            />
                        </div>

                        {/* Hatırlatıcı Alanı */}
                        <div className="w-1/3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Hatırlatıcı</label>
                            <div className="flex items-center gap-2 h-[38px]">
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
                                        className="h-full w-full p-1 text-xs font-bold bg-white border border-gray-200 rounded-lg outline-none focus:border-orange-300 text-gray-700"
                                        required={hasReminder}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6 pt-2">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">İptal</button>
                    <button type="submit" className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 shadow-lg transition transform active:scale-95">Kaydet</button>
                </div>
            </form>
        </div>
    );
};

export default EditQuestModal;