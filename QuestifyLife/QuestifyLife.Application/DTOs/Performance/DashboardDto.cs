using QuestifyLife.Application.DTOs.Quests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Performance
{
    public class DashboardDto
    {
        public string Username { get; set; } = string.Empty;
        public int TotalXp { get; set; }        // Genel Toplam Puan
        public int DailyTarget { get; set; }    // Günlük Hedef (Örn: 100)
        public int PointsEarnedToday { get; set; } // Bugün Toplanan
        public int CurrentStreak { get; set; }  // Seri (Kaç gündür başarıyor)
        public bool IsDayClosed { get; set; }
        public string StreakStatusMessage { get; set; } // Örn: "Dikkat! Serin Tehlikede"
        public string MotivationalMessage { get; set; } // Örn: "Hadi bugün toparlayalım!"
        public int ConsecutiveMissedDays { get; set; } // Kaç gündür kaçırıyor (0, 1 veya 2)

        // Ana ekranda bugünün görevlerini de göstermek isteriz
        public List<QuestDto> TodayQuests { get; set; } = new List<QuestDto>();
        public List<QuestDto> PinnedTemplates { get; set; }
    }
}


