using QuestifyLife.Application.DTOs.Badges;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Auth
{
    public class PublicUserProfileDto
    {
        public string Username { get; set; }
        public string AvatarId { get; set; }
        public int TotalXp { get; set; }
        public int CurrentStreak { get; set; }
        public int Level { get; set; }
        public string PersonalManifesto { get; set; } // Kullanıcının sözü
        public DateTime JoinDate { get; set; } // Ne zamandır üye?

        public List<BadgeDto> EarnedBadges { get; set; } // Sadece kazanılan rozetler
    }
}
