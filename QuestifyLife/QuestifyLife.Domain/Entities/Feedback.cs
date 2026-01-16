using QuestifyLife.Domain.Common;
using System;

namespace QuestifyLife.Domain.Entities
{
    public class Feedback : BaseEntity
    {
        public Guid UserId { get; set; }
        public string Subject { get; set; } = string.Empty; // Konu (Örn: Hata, Öneri)
        public string Message { get; set; } = string.Empty; // Mesaj
        public int Rating { get; set; } // 1-5 arası puanlama (memnuniyet)

        // Opsiyonel: Admin cevapladı mı?
        public bool IsReviewed { get; set; } = false;
    }
}