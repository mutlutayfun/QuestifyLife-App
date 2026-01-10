import React from 'react';

const QuestItem = ({ quest, onComplete, onDelete }) => {
  // Görev kategorisine göre renk belirleyelim (Basit versiyon)
  const categoryColor = quest.colorCode || "#3498db";

  return (
    <div className={`flex items-center justify-between p-4 mb-3 bg-white rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md ${quest.isCompleted ? 'opacity-60' : ''}`}>
      
      {/* Sol Taraf: Checkbox ve Yazılar */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button 
          onClick={() => onComplete(quest.id)}
          disabled={quest.isCompleted}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
            ${quest.isCompleted 
              ? 'bg-secondary border-secondary text-white' 
              : 'border-gray-300 hover:border-secondary'}`}
        >
          {quest.isCompleted && "✓"}
        </button>

        <div className="flex flex-col">
          <span className={`font-semibold text-gray-800 truncate ${quest.isCompleted ? 'line-through text-gray-400' : ''}`}>
            {quest.title}
          </span>
          {quest.description && (
            <span className="text-xs text-gray-500 truncate max-w-xs">
              {quest.description}
            </span>
          )}
        </div>
      </div>

      {/* Sağ Taraf: Puan ve Silme */}
      <div className="flex items-center gap-4">
        <span 
          className="text-xs px-2 py-1 rounded-full text-white font-bold"
          style={{ backgroundColor: categoryColor }}
        >
          +{quest.rewardPoints} P
        </span>
        
        <button 
          onClick={() => onDelete(quest.id)}
          className="text-gray-400 hover:text-danger transition-colors"
          title="Görevi Sil"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default QuestItem;