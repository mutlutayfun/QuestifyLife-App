using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Performance
{
    public class CalendarDayDto
    {
        public DateTime Date { get; set; }
        public int Points { get; set; }
        public bool TargetReached { get; set; }
        public string? Note { get; set; } // O gün aldığı notu takvimde görsün
        public int CompletedQuestCount { get; set; }
    }
}
