using Microsoft.AspNetCore.Mvc;
using QuestifyLife.Application.DTOs.Friends;
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
    public class FriendsController : ControllerBase
    {
        private readonly IFriendService _friendService;

        public FriendsController(IFriendService friendService)
        {
            _friendService = friendService;
        }

        [HttpPost("send-request")]
        public async Task<IActionResult> SendRequest([FromBody] SendFriendRequestDto request)
        {
            request.SenderId = User.GetUserId(); // Token'dan al
            var result = await _friendService.SendRequestAsync(request);
            return Ok(new { message = result });
        }

        [HttpGet("pending-requests")] // ID parametresi kalktı
        public async Task<IActionResult> GetPendingRequests()
        {
            var userId = User.GetUserId();
            var result = await _friendService.GetPendingRequestsAsync(userId);
            return Ok(result);
        }

        [HttpPost("respond/{requestId}")]
        public async Task<IActionResult> Respond(Guid requestId, [FromQuery] bool accept)
        {
            // Burada şimdilik userId kullanmıyoruz ama Authorize olduğu için 
            // sadece giriş yapmış kullanıcılar çağırabilir.
            try
            {
                var result = await _friendService.RespondToRequestAsync(requestId, accept);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("leaderboard")] // URL'den {userId} parametresini kaldırdık
        public async Task<IActionResult> GetLeaderboard()
        {
            var userId = User.GetUserId(); // Token'dan kimliği okuyoruz
            var result = await _friendService.GetFriendsLeaderboardAsync(userId);
            return Ok(result);
        }

        // YENİ: Arkadaş Silme Endpoint'i
        [HttpPost("remove/{friendId}")]
        public async Task<IActionResult> RemoveFriend(Guid friendId)
        {
            var userId = User.GetUserId();
            var result = await _friendService.RemoveFriendAsync(userId, friendId);

            if (result) return Ok(new { message = "Arkadaş silindi." });
            return NotFound("Kayıt bulunamadı.");
        }
    }
}