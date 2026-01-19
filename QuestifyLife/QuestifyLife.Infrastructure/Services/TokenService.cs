using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            // 1. Token içine gömülecek bilgiler (Claims)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // UserId'yi gömüyoruz
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email)
            };
            // --- HATA ÖNLEYİCİ GÜNCELLEME ---B
            // Ayarlardan SecretKey'i çekmeye çalış
            var secretKey = _configuration["JwtSettings:SecretKey"];

            // Eğer dosya okunamazsa veya key yoksa, programın çökmemesi için varsayılanı kullan
            if (string.IsNullOrEmpty(secretKey))
            {
                secretKey = "QuestifyLife_Super_Secret_Key_For_Safety_2024!";
            }
            // 2. Gizli Anahtarı al ve şifrele
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 3. Token ayarlarını yap
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:ExpireMinutes"])),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = creds
            };

            // 4. Token'ı oluştur
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}
