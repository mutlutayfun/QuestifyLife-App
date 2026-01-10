using QuestifyLife.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Domain.Entities;

public class DailyPerformance : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; }

    public DateTime Date { get; set; }
    public int TotalPointsEarned { get; set; }
    public int RolloverDebt { get; set; } // Bir önceki günden gelen borç puan
    public bool IsTargetReached { get; set; } // O gün hedefe ulaşıldı mı?

    public string? DayNote { get; set; }
    // Kullanıcı o gün giriş yapıp günü kapattı mı?
    public bool IsDayClosed { get; set; } = false;
}
