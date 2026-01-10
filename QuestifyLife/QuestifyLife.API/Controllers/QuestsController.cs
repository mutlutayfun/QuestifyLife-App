using Microsoft.AspNetCore.Mvc;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Application.Interfaces;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using QuestifyLife.API.Extensions;

namespace QuestifyLife.API.Controllers

{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QuestsController : ControllerBase
    {
        private readonly IQuestService _questService;

        public QuestsController(IQuestService questService)
        {
            _questService = questService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateQuestRequest request)
        {
            var userId = User.GetUserId();

            request.UserId = userId; // Token'dan gelen güvenli ID

            var quest = await _questService.CreateQuestAsync(request);
            return Ok(new { message = "Görev eklendi!", questId = quest.Id });
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var userId = User.GetUserId(); // Token'dan al
            var quests = await _questService.GetPendingQuestsAsync(userId);
            return Ok(quests);
        }

        [HttpPost("complete/{questId}")]
        public async Task<IActionResult> Complete(Guid questId)
        {
           
            var result = await _questService.CompleteQuestAsync(questId);
            if (!result.IsSuccess) return BadRequest(new { message = result.Message });

            return Ok(result);
        }

        [HttpDelete("{questId}")]
        public async Task<IActionResult> Delete(Guid questId)
        {
            var userId = User.GetUserId(); // Token'dan al
            var result = await _questService.DeleteQuestAsync(questId, userId);

            if (!result) return NotFound("Görev bulunamadı veya silme yetkiniz yok.");

            return Ok(new { message = "Görev silindi." });
        }
    }
}