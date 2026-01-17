using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System.Security.Claims;

namespace QuestifyLife.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<Quest> _questRepository;
        private readonly IGenericRepository<Badge> _badgeRepository;

        public AdminController(
            IGenericRepository<User> userRepository,
            IGenericRepository<Quest> questRepository,
            IGenericRepository<Badge> badgeRepository)
        {
            _userRepository = userRepository;
            _questRepository = questRepository;
            _badgeRepository = badgeRepository;
        }

        private async Task<bool> IsUserAdmin()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return false;

            var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdClaim));
            return user != null && user.IsAdmin;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetSystemStats()
        {
            if (!await IsUserAdmin()) return Unauthorized("Erişim reddedildi.");

            var totalUsers = await _userRepository.GetWhere(x => true).CountAsync();
            var totalQuests = await _questRepository.GetWhere(x => true).CountAsync();
            var completedQuests = await _questRepository.GetWhere(x => x.IsCompleted).CountAsync();
            var totalBadgesAwarded = await _badgeRepository.GetWhere(x => true).CountAsync();

            // Toplam dağıtılan XP (Tüm kullanıcıların XP toplamı)
            var totalSystemXp = await _userRepository.GetWhere(x => true).SumAsync(x => x.TotalXp);

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalQuests = totalQuests,
                CompletedQuests = completedQuests,
                ActiveRatio = totalQuests > 0 ? (completedQuests * 100 / totalQuests) : 0,
                TotalBadges = totalBadgesAwarded,
                TotalSystemXp = totalSystemXp
            });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            if (!await IsUserAdmin()) return Unauthorized("Erişim reddedildi.");

            var users = await _userRepository.GetWhere(x => true)
                .OrderByDescending(u => u.CreatedDate)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.TotalXp,
                    u.Level,
                    u.IsAdmin,
                    u.CurrentStreak,
                    QuestCount = u.Quests.Count,
                    JoinDate = u.CreatedDate
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPost("toggle-admin/{userId}")]
        public async Task<IActionResult> ToggleAdminStatus(Guid userId)
        {
            if (!await IsUserAdmin()) return Unauthorized("Erişim reddedildi.");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (user.Id.ToString() == currentUserId)
            {
                return BadRequest("Kendi yetkinizi değiştiremezsiniz.");
            }

            user.IsAdmin = !user.IsAdmin;
            _userRepository.Update(user);
            await _userRepository.SaveAsync();

            return Ok(new { Message = $"Yetki güncellendi: {(user.IsAdmin ? "Admin" : "Üye")}" });
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            if (!await IsUserAdmin()) return Unauthorized("Erişim reddedildi.");

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (user.Id.ToString() == currentUserId) return BadRequest("Kendinizi silemezsiniz.");

            await _userRepository.RemoveAsync(userId);
            await _userRepository.SaveAsync();

            return Ok(new { Message = "Kullanıcı silindi." });
        }

        // --- YENİ: GÖREV YÖNETİMİ ---

        // Son eklenen 100 görevi getir (İçerik denetimi için)
        [HttpGet("quests")]
        public async Task<IActionResult> GetRecentQuests()
        {
            if (!await IsUserAdmin()) return Unauthorized("Erişim reddedildi.");

            var quests = await _questRepository.GetWhere(x => true)
                .Include(q => q.User) // Kullanıcı bilgisini de al
                .OrderByDescending(q => q.CreatedDate)
                .Take(100)
                .Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    q.Category,
                    q.RewardPoints,
                    q.IsCompleted,
                    q.ScheduledDate,
                    Username = q.User.Username,
                    q.UserId
                })
                .ToListAsync();

            return Ok(quests);
        }

        // Uygunsuz görevi sil
        [HttpDelete("quests/{questId}")]
        public async Task<IActionResult> DeleteQuest(Guid questId)
        {
            if (!await IsUserAdmin()) return Unauthorized("Erişim reddedildi.");

            await _questRepository.RemoveAsync(questId);
            await _questRepository.SaveAsync();

            return Ok(new { Message = "Görev sistemden kaldırıldı." });
        }
    }
}