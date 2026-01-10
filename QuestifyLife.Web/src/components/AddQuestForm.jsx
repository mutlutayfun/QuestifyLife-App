import React, { useState } from 'react';

const AddQuestForm = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(10); // Varsayılan puan
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Üst bileşene veriyi gönder
    onAdd({
        title: title,
        description: "", // Şimdilik boş, detay ekranında eklenebilir
        rewardPoints: parseInt(points),
        scheduledDate: new Date().toISOString(), // Bugün için
        category: "Genel",
        colorCode: "#3498db"
    });

    setTitle("");
    setPoints(10);
    setIsOpen(false); // Ekleme bitince formu kapat
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-semibold hover:border-primary hover:text-primary transition-all"
      >
        + Yeni Görev Ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md mb-4 border border-blue-100 animate-fade-in">
      <div className="mb-3">
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Görev Adı</label>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:border-primary"
          placeholder="Örn: 30 dk Kitap Oku"
          autoFocus
        />
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Puan Değeri</label>
            <select 
                value={points} 
                onChange={(e) => setPoints(e.target.value)}
                className="w-full p-2 border rounded bg-gray-50"
            >
                <option value="10">Kolay (10 P)</option>
                <option value="20">Orta (20 P)</option>
                <option value="50">Zor (50 P)</option>
                <option value="100">Destansı (100 P)</option>
            </select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button 
          type="button" 
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
        >
          İptal
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-600 font-bold"
        >
          Ekle
        </button>
      </div>
    </form>
  );
};

export default AddQuestForm;