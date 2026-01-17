using QuestifyLife.Application.DTOs.Badges;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Auth
{
    public class UserProfileDto
    {
        public string Username { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public string Email { get; set; } = string.Empty;
        public int TotalXp { get; set; }
        public int CurrentStreak { get; set; }
        public int Level { get; set; }
        public int DailyTargetPoints { get; set; }
        public int PointsEarnedThisWeek { get; set; }
        public int PointsEarnedThisMonth { get; set; }

        public int WeeklyTargetPoints { get; set; }
        public int MonthlyTargetPoints { get; set; }
        public int YearlyTargetPoints { get; set; }
        public string? PersonalManifesto { get; set; }
        public string AvatarId { get; set; } // Profilde görünsün

        public bool HasSeenTutorial { get; set; }
        public List<BadgeDto> Badges { get; set; } = new List<BadgeDto>();
    }
}
