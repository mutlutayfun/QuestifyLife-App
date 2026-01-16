namespace QuestifyLife.Application.DTOs.Common
{
    public class CreateFeedbackDto
    {
        public string Subject { get; set; }
        public string Message { get; set; }
        public int Rating { get; set; } // 1 ile 5 arası
    }
}