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

        [HttpPost("toggle/{id}")]
        public async Task<IActionResult> ToggleQuest(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var result = await _questService.ToggleQuestStatusAsync(id, userId);

            if (!result.IsSuccess && result.Message != "Görev geri alındı.") // Hata durumları için
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateQuest([FromBody] UpdateQuestRequest request)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            request.UserId = userId; // Güvenlik için User ID'yi token'dan alıp request'e gömüyoruz

            var result = await _questService.UpdateQuestAsync(request);
            if (!result) return BadRequest("Güncelleme başarısız.");

            return Ok(result);
        }
        [HttpPost("pin/{id}")]
        public async Task<IActionResult> TogglePin(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var isPinned = await _questService.TogglePinStatusAsync(id, userId);
            return Ok(new { IsPinned = isPinned, Message = isPinned ? "Görev sabitlendi (Yarın tekrar gelecek)." : "Sabitleme kaldırıldı." });
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