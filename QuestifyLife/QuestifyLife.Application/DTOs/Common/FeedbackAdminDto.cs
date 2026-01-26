using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Common
{
    // Admin listesinde görünecek veri
    public class FeedbackAdminDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty; // Cevap için gerekli
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int Rating { get; set; }
        public bool IsReviewed { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    // Admin cevaplarken kullanacağı veri
    public class ReplyFeedbackDto
    {
        public Guid FeedbackId { get; set; }
        public string ReplyMessage { get; set; } = string.Empty;
    }
}
