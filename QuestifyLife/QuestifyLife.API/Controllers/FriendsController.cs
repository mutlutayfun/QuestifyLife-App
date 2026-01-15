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

            try
            {
                var result = await _friendService.SendRequestAsync(request);
                // Başarılıysa string dönüyor (Exception fırlatmazsa)
                return Ok(new { message = result, isSuccess = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, isSuccess = false });
            }
        }

        // --- YENİ ENDPOINT: ID ile İstek Gönder ---
        [HttpPost("send-request/{targetUserId}")]
        public async Task<IActionResult> SendRequestById(Guid targetUserId)
        {
            var userId = User.GetUserId();
            try
            {
                var result = await _friendService.SendFriendRequestByIdAsync(userId, targetUserId);
                return Ok(new { message = result, isSuccess = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message, isSuccess = false });
            }
        }
        // ------------------------------------------

        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var userId = User.GetUserId();
            var result = await _friendService.GetPendingRequestsAsync(userId);
            return Ok(result);
        }

        [HttpPost("respond/{requestId}")]
        public async Task<IActionResult> Respond(Guid requestId, [FromQuery] bool accept)
        {
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

        [HttpGet("leaderboard")]
        public async Task<IActionResult> GetLeaderboard()
        {
            var userId = User.GetUserId();
            var result = await _friendService.GetFriendsLeaderboardAsync(userId);
            return Ok(result);
        }

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