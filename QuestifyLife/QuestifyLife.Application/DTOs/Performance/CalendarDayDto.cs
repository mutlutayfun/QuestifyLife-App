using System;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Collections.Generic;

namespace QuestifyLife.Application.DTOs.Performance
{
    public class CalendarDayDto
    {
        public DateTime Date { get; set; }
        public int Points { get; set; }
        public bool TargetReached { get; set; }
        public string? Note { get; set; }
        public int CompletedQuestCount { get; set; }

        public bool IsDayClosed { get; set; }

        // Artık sadece string değil, detaylı nesne listesi tutuyoruz
        public List<CalendarQuestDto> CompletedQuests { get; set; } = new List<CalendarQuestDto>();
    }

    public class CalendarQuestDto
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = "Genel";
        public int RewardPoints { get; set; }
    }
}
