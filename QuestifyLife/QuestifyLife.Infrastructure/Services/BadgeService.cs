using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Badges;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
    public class BadgeService : IBadgeService
    {
        private readonly IGenericRepository<Badge> _badgeRepository;
        private readonly IGenericRepository<UserBadge> _userBadgeRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<Quest> _questRepository;

        public BadgeService(
            IGenericRepository<Badge> badgeRepository,
            IGenericRepository<UserBadge> userBadgeRepository,
            IGenericRepository<User> userRepository,
            IGenericRepository<Quest> questRepository)
        {
            _badgeRepository = badgeRepository;
            _userBadgeRepository = userBadgeRepository;
            _userRepository = userRepository;
            _questRepository = questRepository;
        }

        public async Task SeedBadgesAsync()
        {
            // Eğer veritabanı boşsa varsayılan rozetleri ekle
            if (await _badgeRepository.GetWhere(x => true).AnyAsync()) return;

            var badges = new List<Badge>
            {
                new Badge { Name = "Çaylak", Description = "İlk 100 Puanı Kazan", IconName = "star", Type = BadgeType.TotalXp, Threshold = 100 },
                new Badge { Name = "Usta", Description = "1000 Puana Ulaş", IconName = "crown", Type = BadgeType.TotalXp, Threshold = 1000 },
                new Badge { Name = "İstikrarlı", Description = "3 Günlük Seri Yap", IconName = "fire", Type = BadgeType.Streak, Threshold = 3 },
                new Badge { Name = "Yenilmez", Description = "7 Günlük Seri Yap", IconName = "dragon", Type = BadgeType.Streak, Threshold = 7 },
                new Badge { Name = "Görev Adamı", Description = "10 Görev Tamamla", IconName = "check-double", Type = BadgeType.QuestCount, Threshold = 10 }
            };

            foreach (var b in badges) await _badgeRepository.AddAsync(b);
            await _badgeRepository.SaveAsync();
        }

        public async Task<List<string>> CheckAndAwardBadgesAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return new List<string>();

            int completedQuestCount = await _questRepository.GetWhere(q => q.UserId == userId && q.IsCompleted).CountAsync();
            var allBadges = await _badgeRepository.GetAllAsync();
            var earnedBadgeIds = await _userBadgeRepository.GetWhere(ub => ub.UserId == userId).Select(ub => ub.BadgeId).ToListAsync();

            var newEarnedBadges = new List<string>(); // Yeni kazanılanları burada toplayacağız

            foreach (var badge in allBadges)
            {
                if (earnedBadgeIds.Contains(badge.Id)) continue;

                bool isEarned = false;
                switch (badge.Type)
                {
                    case BadgeType.TotalXp:
                        if (user.TotalXp >= badge.Threshold) isEarned = true;
                        break;
                    case BadgeType.Streak:
                        if (user.CurrentStreak >= badge.Threshold) isEarned = true;
                        break;
                    case BadgeType.QuestCount:
                        if (completedQuestCount >= badge.Threshold) isEarned = true;
                        break;
                }

                if (isEarned)
                {
                    await _userBadgeRepository.AddAsync(new UserBadge
                    {
                        UserId = userId,
                        BadgeId = badge.Id,
                        EarnedDate = DateTime.UtcNow
                    });

                    // Listeye ekle ki kullanıcıya müjdeyi verelim!
                    newEarnedBadges.Add(badge.Name);
                }
            }

            if (newEarnedBadges.Any())
            {
                await _userBadgeRepository.SaveAsync();
            }

            return newEarnedBadges; // Listeyi geri dön
        }

        public async Task<List<BadgeDto>> GetUserBadgesAsync(Guid userId)
        {
            var allBadges = await _badgeRepository.GetAllAsync();
            var userBadges = await _userBadgeRepository.GetWhere(ub => ub.UserId == userId).ToListAsync();

            var result = new List<BadgeDto>();

            foreach (var badge in allBadges)
            {
                var earned = userBadges.FirstOrDefault(ub => ub.BadgeId == badge.Id);

                result.Add(new BadgeDto
                {
                    Name = badge.Name,
                    Description = badge.Description,
                    IconName = badge.IconName,
                    IsEarned = earned != null, // Kazanıldı mı?
                    EarnedDate = earned?.EarnedDate
                });
            }

            return result;
        }
    }
}
