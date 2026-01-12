import React, { useState } from 'react';

const AddQuestForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // YENİ: Açıklama
  const [points, setPoints] = useState(10);
  const [category, setCategory] = useState(""); // YENİ: Manuel Kategori
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasyon: Başlık ve Kategori zorunlu
    if (!title.trim() || !category.trim()) {
        alert("Lütfen görev adı ve kategori giriniz.");
        return;
    }

    onAdd({
        title: title,
        description: description,
        rewardPoints: parseInt(points),
        scheduledDate: new Date().toISOString(),
        category: category, 
        colorCode: "#3498db" // Varsayılan mavi renk
    });

    // Formu temizle
    setTitle("");
    setDescription("");
    setPoints(10);
    setCategory("");
    setIsOpen(false);
  };

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
      
      <div className="flex gap-4 mb-4">
        {/* Puan Seçimi */}
        <div className="flex-1">
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Zorluk (XP)</label>
            <select 
                value={points} 
                onChange={(e) => setPoints(e.target.value)}
                className="w-full p-2 border border-gray-100 rounded-lg bg-gray-50 text-sm"
            >
                <option value="10">Kolay (10 XP)</option>
                <option value="20">Orta (20 XP)</option>
                <option value="50">Zor (50 XP)</option>
                <option value="100">Efsanevi (100 XP)</option>
            </select>
        </div>

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
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 text-sm font-bold">İptal</button>
        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow-md hover:bg-blue-600">Ekle</button>
      </div>
    </form>
  );
};

export default AddQuestForm;