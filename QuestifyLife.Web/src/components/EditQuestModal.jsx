import React, { useState, useEffect } from 'react';

const EditQuestModal = ({ isOpen, onClose, onUpdate, quest }) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        points: 10,
        category: ""
    });

    useEffect(() => {
        if (quest) {
            setFormData({
                title: quest.title,
                description: quest.description || "",
                points: quest.rewardPoints,
                category: quest.category || "Diğer"
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quest]); // Sadece quest değiştiğinde çalışsın yeterli

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ ...quest, ...formData }); 
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fade-in-up">
                <h3 className="text-lg font-black text-gray-800 mb-4 border-b pb-2">Görevi Düzenle</h3>
                
                <div className="space-y-4">
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

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Açıklama</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:border-primary outline-none h-20 resize-none text-sm"
                        />
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Puan</label>
                            <select 
                                value={formData.points} 
                                onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                                className="w-full p-2 border rounded-lg bg-gray-50 text-sm"
                            >
                                <option value="10">10 XP</option>
                                <option value="20">20 XP</option>
                                <option value="50">50 XP</option>
                                <option value="100">100 XP</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori</label>
                            <input 
                                type="text"
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full p-2 border rounded-lg focus:border-primary outline-none text-sm"
                            />
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
