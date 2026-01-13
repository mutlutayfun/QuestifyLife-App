using System;

namespace QuestifyLife.Application.DTOs.Performance
{
    public class LeaderboardUserDto
    {
        public Guid UserId { get; set; }
        public int Rank { get; set; } // Sıralama (1., 2. vb.)
        public string Username { get; set; }
        public string AvatarId { get; set; } // Avatarı göstermek için
        public int TotalXp { get; set; }
        public bool IsCurrentUser { get; set; } // Listeyi çeken kişi bu mu? (Highlight için)
    }
}