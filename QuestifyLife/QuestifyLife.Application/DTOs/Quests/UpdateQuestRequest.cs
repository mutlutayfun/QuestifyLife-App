using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace QuestifyLife.Application.DTOs.Quests
{
    public class UpdateQuestRequest
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; } // Güvenlik kontrolü için
        public string Title { get; set; }
        public string? Description { get; set; }
        public int RewardPoints { get; set; }
        public string Category { get; set; }
        public bool IsPinned { get; set; }
    }
}

