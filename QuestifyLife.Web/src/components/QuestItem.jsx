import React from 'react';

const QuestItem = ({ quest, onToggle, onDelete, onEdit }) => {
    return (
        <div className={`group relative flex items-center justify-between p-4 mb-3 bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md ${quest.isCompleted ? 'bg-gray-50 opacity-90' : ''}`}>
            
            <div className="flex items-center gap-3 overflow-hidden">
                {/* TOGGLE BUTONU */}
                <button 
                    onClick={() => onToggle(quest.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${quest.isCompleted 
                          ? 'bg-green-500 border-green-500 text-white scale-110' 
                          : 'border-gray-300 hover:border-blue-400 text-transparent'}`}
                >
                    ✓
                </button>

                <div className="flex flex-col min-w-0">
                    <span className={`font-bold text-gray-800 text-sm truncate transition-all ${quest.isCompleted ? 'line-through text-gray-400' : ''}`}>
                        {quest.title}
                    </span>
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
                
                {/* DÜZENLEME VE SİLME BUTONLARI (Sadece üzerine gelince görünür) */}
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>
        </div>
    );
};

export default QuestItem;