using Microsoft.AspNetCore.Mvc;
using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.Wrappers;
using System;
using System.Threading.Tasks;

namespace QuestifyLife.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;

        public AuthController(IAuthService authService, ITokenService tokenService)
        {
            _authService = authService;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _authService.RegisterAsync(request);
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    DailyTargetPoints = user.DailyTargetPoints,
                    TotalXp = user.TotalXp
                };
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _authService.LoginAsync(request);

            if (user == null)
            {
                return Unauthorized(new { message = "Email veya şifre hatalı." });
            }

            var token = _tokenService.GenerateToken(user);
            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                DailyTargetPoints = user.DailyTargetPoints,
                TotalXp = user.TotalXp
            };

            return Ok(new { message = "Giriş başarılı!", token = token, user = userDto });
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<ServiceResponse<bool>>> ChangePassword(ChangePasswordDto request)
        {
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var response = await _authService.ChangePasswordAsync(userId, request.OldPassword, request.NewPassword);

            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // --- YENİ ENDPOINTLER ---

        // Şifremi Unuttum (E-posta ile istek)
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            // Frontend'den string gönderirken tırnaklar önemlidir veya bir obje içinde gönderilir.
            // Basitlik için string alıyoruz.
            var response = await _authService.ForgotPasswordAsync(email);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }

        // Şifre Sıfırlama İsteği Modeli
        public class ResetPasswordRequest
        {
            public string Token { get; set; }
            public string NewPassword { get; set; }
        }

        // Şifre Sıfırlama (Token ve Yeni Şifre ile)
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var response = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
            if (!response.Success) return BadRequest(response);
            return Ok(response);
        }
    }
}