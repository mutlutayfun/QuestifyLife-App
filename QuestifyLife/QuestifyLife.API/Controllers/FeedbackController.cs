using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestifyLife.API.Extensions;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System.Threading.Tasks;

namespace QuestifyLife.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly IGenericRepository<Feedback> _feedbackRepository;

        // Servis katmanı yerine hızlıca Repository kullanıyoruz (Basit işlem için)
        public FeedbackController(IGenericRepository<Feedback> feedbackRepository)
        {
            _feedbackRepository = feedbackRepository;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto request)
        {
            var userId = User.GetUserId();

            var feedback = new Feedback
            {
                UserId = userId,
                Subject = request.Subject,
                Message = request.Message,
                Rating = request.Rating,
                IsReviewed = false,
                CreatedDate = System.DateTime.UtcNow
            };

            await _feedbackRepository.AddAsync(feedback);
            await _feedbackRepository.SaveAsync();

            return Ok(new { success = true, message = "Geri bildiriminiz için teşekkürler! 🚀" });
        }
    }
}