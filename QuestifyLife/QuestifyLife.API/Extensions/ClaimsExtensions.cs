using System.Security.Claims;
using System;

namespace QuestifyLife.API.Extensions
{
    public static class ClaimsExtensions
    {
        public static Guid GetUserId(this ClaimsPrincipal user)
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(idClaim))
                throw new Exception("Token içinde Kullanıcı ID bulunamadı! (Lütfen tekrar giriş yapın)");

            return Guid.Parse(idClaim);
        }
    }
}
