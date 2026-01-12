using Microsoft.AspNetCore.Mvc;
using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.Wrappers;
using System;
using System.Threading.Tasks;

namespace QuestifyLife.API.Controllers
{
    [Route("api/[controller]")] // Adresimiz: .../api/auth olacak
    [ApiController] // Bu sınıfın bir API olduğunu belirtir
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;

        // Dependency Injection ile Servisi içeri alıyoruz
        public AuthController(IAuthService authService, ITokenService tokenService)
        {
            _authService = authService;
            _tokenService = tokenService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                // 1. Servise işi yaptır
                var user = await _authService.RegisterAsync(request);

                // 2. Dönen veriyi temiz DTO'ya çevir (Mapping)
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    DailyTargetPoints = user.DailyTargetPoints,
                    TotalXp = user.TotalXp
                };

                // 3. Başarılı (200 OK) cevabı dön
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                // Hata varsa (örn: email kullanımda), 400 Bad Request dön
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _authService.LoginAsync(request);

            if (user == null)
            {
                return Unauthorized(new { message = "Email veya şifre hatalı." });
            }

            // KULLANICI DOĞRUYSA TOKEN ÜRET
            var token = _tokenService.GenerateToken(user);

            var userDto = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                DailyTargetPoints = user.DailyTargetPoints,
                TotalXp = user.TotalXp
            };

            // Cevap olarak Token'ı da dönüyoruz
            return Ok(new { message = "Giriş başarılı!", token = token, user = userDto });
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<ServiceResponse<bool>>> ChangePassword(ChangePasswordDto request)
        {
            // Giriş yapmış kullanıcının ID'sini al (Claim'lerden)
            var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

            var response = await _authService.ChangePasswordAsync(userId, request.OldPassword, request.NewPassword);

            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }
    }
}