import React, { useState } from 'react';

const DayEndModal = ({ isOpen, onClose, onConfirm, summary }) => {
    const [note, setNote] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm mx-4 relative transform transition-all scale-100">
                
                {/* Kapatma Butonu */}
                <button 
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold"
                >
                    ✕
                </button>

                <div className="text-center mb-4">
                    <span className="text-4xl">🌙</span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">Günü Bitiriyor musun?</h2>
                    <p className="text-sm text-gray-500">Bugünkü maceranı kayda geçelim.</p>
                </div>

                {/* Özet Bilgi */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">Bugün Kazanılan</p>
                    <p className="text-2xl font-bold text-primary">{summary?.pointsEarnedToday || 0} XP</p>
                </div>

                {/* Not Alanı */}
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Günün Notu (Opsiyonel)</label>
                    <textarea 
                        className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:border-primary text-sm h-24 resize-none"
                        placeholder="Bugün nasıldı? Neleri başardın?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition"
                    >
                        Vazgeç
                    </button>
                    <button 
                        onClick={() => onConfirm(note)}
                        className="flex-1 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        Günü Kapat
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DayEndModal;