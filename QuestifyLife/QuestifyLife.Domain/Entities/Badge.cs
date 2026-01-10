using QuestifyLife.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Domain.Entities
{
    public class Badge : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // Örn: "Erkenci Kuş"
        public string Description { get; set; } = string.Empty; // "Sabah 8'den önce görev tamamla"
        public string IconName { get; set; } = "default_badge"; // Frontend için ikon adı (FontAwesome vs.)

        // Rozetin kazanılma şartı (Basit bir kural seti için)
        // Örn: Type="Streak", Threshold=7 (7 gün seri yap)
        public BadgeType Type { get; set; }
        public int Threshold { get; set; }

        public ICollection<UserBadge> UserBadges { get; set; } = new List<UserBadge>();
    }

    public enum BadgeType
    {
        TotalXp,       // Toplam Puan
        Streak,        // Günlük Seri
        QuestCount     // Tamamlanan Görev Sayısı
    }

    // Çoka-Çok İlişki Tablosu (Hangi kullanıcı hangi rozeti ne zaman aldı?)
    public class UserBadge : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; }

        public Guid BadgeId { get; set; }
        public Badge Badge { get; set; }

        public DateTime EarnedDate { get; set; } = DateTime.UtcNow;
    }
}
