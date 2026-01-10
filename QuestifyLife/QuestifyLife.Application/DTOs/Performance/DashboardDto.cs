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

        // Ana ekranda bugünün görevlerini de göstermek isteriz
        public List<QuestDto> TodayQuests { get; set; } = new List<QuestDto>();
    }
}


