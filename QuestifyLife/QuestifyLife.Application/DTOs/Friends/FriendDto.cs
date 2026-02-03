using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Friends
{
    public class FriendDto
    {
        public Guid FriendId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? AvatarId { get; set; } = "avatar_1";
        public int TotalXp { get; set; } // Yarışma için önemli!

        // YENİ: Detay vermeden istatistik gösteriyoruz
        public int DailyStreak { get; set; } // Serisi
        public bool IsOnlineToday { get; set; } // Bugün giriş yaptı mı?
    }
}
