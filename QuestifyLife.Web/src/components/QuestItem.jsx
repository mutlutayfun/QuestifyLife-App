import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function QuestItem({ quest, onToggle, onDelete, onEdit, onPin, isDayClosed, disabled }) {
    const isCompleted = quest.isCompleted;
    
    // Butonların gösterilip gösterilmeyeceği kontrolü
    // Eğer butonlar gizliyse, mobilde ekstra sağ padding (boşluk) bırakmaya gerek yok.
    const showButtons = !disabled && !isDayClosed;

    // Kategori renkleri ve ikonları
    const getCategoryStyle = (cat) => {
        switch(cat?.toLowerCase()) {
            case 'genel': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'özel': return 'bg-red-100 text-red-600 border-red-200';
            case 'spor': return 'bg-orange-100 text-orange-600 border-orange-200';
            case 'yazılım': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'okul': return 'bg-purple-100 text-purple-600 border-purple-200';
            case 'sağlık': return 'bg-green-100 text-green-600 border-green-200';
            case 'kişisel gelişim': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
            case 'diğer': return 'bg-pink-100 text-pink-600 border-pink-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div 
            className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 animate-fade-in
                ${isCompleted 
                    ? 'bg-green-50/50 border-green-100' 
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                }
                ${disabled ? 'opacity-70 grayscale-[0.5]' : ''}
            `}
        >
            {/* Tamamla Butonu (Checkbox) */}
            <button 
                onClick={() => !disabled && !isDayClosed && onToggle(quest.id)}
                disabled={disabled || isDayClosed}
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted 
                        ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 scale-105' 
                        : 'bg-white border-gray-200 text-transparent hover:border-green-400'
                    }
                    ${(disabled || isDayClosed) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-90'}
                `}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </button>

            {/* İçerik */}
            {/* DÜZELTME: showButtons true ise (mobilde butonlar var demektir), sağa padding (pr-20) ekleyerek metnin butonların altına girmesini engelliyoruz. */}
            <div className={`flex-1 min-w-0 select-none ${showButtons ? 'pr-20 sm:pr-0' : ''}`} onClick={() => !disabled && !isDayClosed && onToggle(quest.id)}>
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`font-bold text-base truncate transition-all duration-300 ${isCompleted ? 'text-gray-400 line-through decoration-2 decoration-green-300' : 'text-gray-800'}`}>
                        {quest.title}
                    </h4>
                    {quest.isPinned && <span className="text-[10px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-200" title="Pinli Görev">📌</span>}
                </div>
                
                <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md border font-medium ${getCategoryStyle(quest.category)}`}>
                        {quest.category || 'Genel'}
                    </span>
                    <span className={`font-bold ${isCompleted ? 'text-gray-400' : 'text-blue-500'}`}>
                        +{quest.rewardPoints} XP
                    </span>
                    {quest.description && (
                         <span className="text-gray-400 truncate max-w-[120px] hidden sm:block"> • {quest.description}</span>
                    )}
                    {quest.reminderDate && (
                        <span className="text-orange-400 flex items-center gap-1">
                            ⏰ {format(new Date(quest.reminderDate), 'HH:mm', { locale: tr })}
                        </span>
                    )}
                </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className={`flex items-center gap-1 absolute right-2 top-2 sm:relative sm:right-0 sm:top-0 transition-opacity duration-200
                ${!showButtons ? 'hidden' : 'opacity-40 group-hover:opacity-100'} 
            `}>
                <button 
                    onClick={(e) => { e.stopPropagation(); onPin(quest.id); }}
                    className={`p-1.5 rounded-lg transition-colors ${quest.isPinned ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'}`}
                    title={quest.isPinned ? "Pini Kaldır" : "Pinle"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={quest.isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(quest); }}
                    className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 rounded-lg transition-colors"
                    title="Düzenle"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>

                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(quest.id); }}
                    className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    title="Sil"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}