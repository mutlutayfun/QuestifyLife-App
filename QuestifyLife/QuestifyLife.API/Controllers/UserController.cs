using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestifyLife.API.Extensions;
using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.Interfaces;
using System.Threading.Tasks;

namespace QuestifyLife.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Güvenli Kilit
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.GetUserId();
            var profile = await _userService.GetProfileAsync(userId);
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
        {
            var userId = User.GetUserId();
            var result = await _userService.UpdateProfileAsync(userId, request);

            if (result) return Ok(new { message = "Profil güncellendi." });
            return BadRequest("Güncelleme başarısız.");
        }
        [HttpGet("public/{userId}")]
        public async Task<IActionResult> GetPublicProfile(Guid userId)
        {
            var response = await _userService.GetPublicUserProfileAsync(userId);
            if (!response.Success) return NotFound(response);
            return Ok(response);
        }

        [HttpPost("complete-tutorial")]
        public async Task<IActionResult> CompleteTutorial()
        {
            var userId = User.GetUserId();
            var result = await _userService.CompleteTutorialAsync(userId);
            return Ok(result);
        }

    }
}