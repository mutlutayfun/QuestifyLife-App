import React from 'react';

// Props'a isDayClosed eklendi
const QuestItem = ({ quest, onToggle, onDelete, onEdit, onPin, isDayClosed }) => {
    return (
        <div className={`group relative flex items-center justify-between p-4 mb-3 bg-white rounded-xl shadow-sm border transition-all hover:shadow-md 
            ${quest.isCompleted ? 'bg-gray-50 opacity-90 border-gray-100' : 'border-gray-100'}
            ${quest.isPinned ? 'border-l-4 border-l-yellow-400' : ''}
            ${isDayClosed ? 'opacity-60 grayscale-[0.5] pointer-events-none' : ''} 
        `}>
            {/* isDayClosed ise pointer-events-none ile tıklamaları engelledik, görsel olarak soluklaştırdık */}
            
            <div className="flex items-center gap-3 overflow-hidden">
                <button 
                    onClick={() => !isDayClosed && onToggle(quest.id)}
                    disabled={isDayClosed}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${quest.isCompleted 
                          ? 'bg-green-500 border-green-500 text-white scale-110' 
                          : 'border-gray-300 hover:border-blue-400 text-transparent'}
                        ${isDayClosed ? 'cursor-not-allowed border-gray-200' : ''}  
                    `}
                >
                    ✓
                </button>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold text-gray-800 text-sm truncate transition-all ${quest.isCompleted ? 'line-through text-gray-400' : ''}`}>
                            {quest.title}
                        </span>
                        {/* Sabitlenmiş İkonu */}
                        {quest.isPinned && <span className="text-[10px]" title="Her gün tekrar eder">📌</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] items-center">
                         <span className="font-bold text-gray-400 uppercase tracking-wider">{quest.category}</span>
                         {quest.description && <span className="text-gray-400 truncate max-w-[150px]">• {quest.description}</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pl-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black whitespace-nowrap ${quest.isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-primary'}`}>
                    +{quest.rewardPoints} XP
                </span>
                
                {/* AKSİYON BUTONLARI - Gün kapalıysa GİZLE */}
                {!isDayClosed && (
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button 
                            onClick={() => onPin(quest.id)} 
                            className={`p-1.5 rounded-lg transition-colors ${quest.isPinned ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'}`}
                            title={quest.isPinned ? "Sabitlemeyi Kaldır" : "Sabitle (Her gün tekrar et)"}
                        >
                            📌
                        </button>
                        
                        <button 
                            onClick={() => onEdit(quest)} 
                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                        >
                            ✏️
                        </button>
                        <button 
                            onClick={() => onDelete(quest.id)} 
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestItem;

