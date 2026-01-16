using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Quests;

public class CreateQuestRequest
{
    [JsonIgnore]
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int RewardPoints { get; set; } = 10; // Kullanıcı belirleyebilir veya biz atarız
    public DateTime? ScheduledDate { get; set; } // Hangi gün yapılacak?
    public DateTime? ReminderDate { get; set; }
    public string Category { get; set; } = "Genel";
    public string ColorCode { get; set; } = "#3498db";
}
