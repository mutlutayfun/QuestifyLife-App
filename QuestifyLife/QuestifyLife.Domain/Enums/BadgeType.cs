using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Domain.Enums
{
    public enum BadgeType
    {
        TotalXp,        // Toplam Puan (Örn: 1000 XP)
        Streak,         // Günlük Seri (Örn: 7 Gün)
        QuestCount,     // Toplam Görev Sayısı (Örn: 50 Görev)
        GoalAchieved   // YENİ: Kategori Bazlı (Örn: 10 Spor görevi)
    }
}
