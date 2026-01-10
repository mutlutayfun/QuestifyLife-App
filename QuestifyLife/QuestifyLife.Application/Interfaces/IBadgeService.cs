using QuestifyLife.Application.DTOs.Badges;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Interfaces
{
    public interface IBadgeService
    {
        // Rozetleri listele (Kazanılanlar işaretli gelir)
        Task<List<BadgeDto>> GetUserBadgesAsync(Guid userId);

        // Arka planda çalışacak kontrol mekanizması
        Task<List<string>> CheckAndAwardBadgesAsync(Guid userId);

        // Sisteme varsayılan rozetleri yüklemek için (Seed)
        Task SeedBadgesAsync();
    }
}
