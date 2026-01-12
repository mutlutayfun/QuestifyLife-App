using QuestifyLife.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Domain.Entities;

public class Quest : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int RewardPoints { get; set; } = 10; // Yapılırsa kazanılacak puan
    public int PenaltyPoints { get; set; } = -5; // Yapılmazsa kaybedilecek puan

    public DateTime ScheduledDate { get; set; } // Hangi gün için planlandı?
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedDate { get; set; }
    public bool IsPinned { get; set; }

    // Kategori (İş, Sağlık, Spor vb. - İleride Enum veya ayrı tablo olabilir)
    public string Category { get; set; } = "General";
    public string ColorCode { get; set; } = "#3498db"; // Hex Code (Mavi varsayılan)
}
