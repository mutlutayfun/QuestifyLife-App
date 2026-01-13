using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Badges
{
    public class BadgeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public bool IsEarned { get; set; } // Kullanıcı bunu kazanmış mı?
        public DateTime? EarnedDate { get; set; }
        public string Rarity { get; set; } // common, rare, epic, legendary
    }
}
