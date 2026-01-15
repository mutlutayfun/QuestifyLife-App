using Microsoft.AspNetCore.Mvc;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.DTOs.Performance;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using QuestifyLife.API.Extensions;

namespace QuestifyLife.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PerformanceController : ControllerBase
    {
        private readonly IPerformanceService _performanceService;

        public PerformanceController(IPerformanceService performanceService)
        {
            _performanceService = performanceService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] DateTime? date) // Tarih parametresi eklendi
        {
            var userId = User.GetUserId();
            // Tarihi servise iletiyoruz
            return Ok(await _performanceService.GetDashboardAsync(userId, date));
        }
        public class FinishDayRequest { public string? Note { get; set; } }

        [HttpPost("finish-day")]
        public async Task<IActionResult> FinishDay([FromBody] FinishDayRequest request)
        {
            var userId = User.GetUserId();
            var result = await _performanceService.FinishDayAsync(userId, request.Note);
            return Ok(result);
        }

        // YENİ ENDPOINT: Takvim
        [HttpGet("calendar")]
        public async Task<IActionResult> GetCalendar([FromQuery] int year, [FromQuery] int month)
        {
            // Kullanım: api/Performance/calendar?year=2024&month=10
            var userId = User.GetUserId();
            var data = await _performanceService.GetCalendarDataAsync(userId, year, month);
            return Ok(data);
        }
        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var response = await _performanceService.GetLeaderboardAsync(userId);
            return Ok(response);
        }

    }

}