using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestifyLife.API.Extensions;
using QuestifyLife.Application.Interfaces;
using System.Threading.Tasks;

namespace QuestifyLife.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BadgesController : ControllerBase
    {
        private readonly IBadgeService _badgeService;

        public BadgesController(IBadgeService badgeService)
        {
            _badgeService = badgeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyBadges()
        {
            var userId = User.GetUserId();
            var badges = await _badgeService.GetUserBadgesAsync(userId);
            return Ok(badges);
        }

        // Geçici Endpoint: Rozetleri Yüklemek İçin (Sadece bir kez çalıştır)
        [HttpPost("seed")]
        public async Task<IActionResult> SeedBadges()
        {
            await _badgeService.SeedBadgesAsync();
            return Ok("Rozet tanımları veritabanına yüklendi.");
        }
    }
}