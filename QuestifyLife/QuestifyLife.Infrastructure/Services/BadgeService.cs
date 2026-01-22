using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Badges;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using QuestifyLife.Domain.Enums; // <--- BU SATIR BADGETYPE HATASINI ÇÖZER
using System;
using System.Collections.Generic;
using System.Linq;
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
            if (await _badgeRepository.GetWhere(x => true).AnyAsync()) return;

            var badges = new List<Badge>
            {
                // Enum kullanımı burada yapılıyor, yukarıdaki using sayesinde hata vermez
                new() { Name = "Çaylak", Description = "İlk 100 Puanı Kazan", IconName = "star", Type = BadgeType.TotalXp, Threshold = 100, Rarity = "common" },
                new() { Name = "Bronz Kupa", Description = "1.000 XP'ye Ulaş", IconName = "trophy_bronze", Type = BadgeType.TotalXp, Threshold = 1000, Rarity = "common" },
                new() { Name = "Gümüş Kupa", Description = "5.000 XP'ye Ulaş", IconName = "trophy_silver", Type = BadgeType.TotalXp, Threshold = 5000, Rarity = "rare" },
                new() { Name = "Altın Kupa", Description = "10.000 XP'ye Ulaş", IconName = "trophy_gold", Type = BadgeType.TotalXp, Threshold = 10000, Rarity = "epic" },
                new() { Name = "Elmas Kupa", Description = "50.000 XP'ye Ulaş", IconName = "diamond", Type = BadgeType.TotalXp, Threshold = 50000, Rarity = "legendary" },

                new() { Name = "İstikrarlı", Description = "3 Günlük Seri Yap", IconName = "flame", Type = BadgeType.Streak, Threshold = 3, Rarity = "common" },
                new() { Name = "Haftalık Savaşçı", Description = "7 Günlük Seri Yap", IconName = "shield", Type = BadgeType.Streak, Threshold = 7, Rarity = "rare" },
                new() { Name = "Disiplin Abidesi", Description = "30 Günlük Seri Yap", IconName = "gem", Type = BadgeType.Streak, Threshold = 30, Rarity = "epic" },
                new() { Name = "Yenilmez", Description = "100 Günlük Seri Yap", IconName = "crown", Type = BadgeType.Streak, Threshold = 100, Rarity = "legendary" },

                new() { Name = "İlk Adım", Description = "İlk Görevini Tamamla", IconName = "scroll", Type = BadgeType.QuestCount, Threshold = 1, Rarity = "common" },
                new() { Name = "Görev Avcısı", Description = "10 Görev Tamamla", IconName = "dagger", Type = BadgeType.QuestCount, Threshold = 10, Rarity = "common" },
                new() { Name = "Görev Ustası", Description = "50 Görev Tamamla", IconName = "sword", Type = BadgeType.QuestCount, Threshold = 50, Rarity = "rare" },
                new() { Name = "Efsane", Description = "100 Görev Tamamla", IconName = "dragon", Type = BadgeType.QuestCount, Threshold = 100, Rarity = "epic" },

               new() { Name = "Haftanın Yıldızı", Description = "Haftalık hedefini tuttur", IconName = "rocket", Type = BadgeType.GoalAchieved, Threshold = 1, TargetContext = "Weekly", Rarity = "rare" },
                new() { Name = "Ayın Elemanı", Description = "Aylık hedefini tuttur", IconName = "calendar", Type = BadgeType.GoalAchieved, Threshold = 1, TargetContext = "Monthly", Rarity = "epic" },
                new() { Name = "Yılın Efsanesi", Description = "Yıllık hedefini tuttur", IconName = "target", Type = BadgeType.GoalAchieved, Threshold = 1, TargetContext = "Yearly", Rarity = "legendary" }

            };

            foreach (var b in badges) await _badgeRepository.AddAsync(b);
            await _badgeRepository.SaveAsync();
        }

        public async Task<List<string>> CheckAndAwardBadgesAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return new List<string>();

            var completedQuests = await _questRepository.GetWhere(q => q.UserId == userId && q.IsCompleted).ToListAsync();
            int totalQuestCount = completedQuests.Count;

            var categoryCounts = completedQuests
                .GroupBy(q => q.Category)
                .ToDictionary(g => g.Key, g => g.Count());

            var allBadges = await _badgeRepository.GetAllAsync();
            var earnedBadgeIds = await _userBadgeRepository
                .GetWhere(ub => ub.UserId == userId)
                .Select(ub => ub.BadgeId)
                .ToListAsync();

            var newEarnedBadges = new List<string>();

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
                        if (totalQuestCount >= badge.Threshold) isEarned = true;
                        break;

                    case BadgeType.GoalAchieved:
                        if (!string.IsNullOrEmpty(badge.TargetContext) &&
                            categoryCounts.ContainsKey(badge.TargetContext) &&
                            categoryCounts[badge.TargetContext] >= badge.Threshold)
                        {
                            isEarned = true;
                        }
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

                    newEarnedBadges.Add(badge.Name);
                }
            }

            if (newEarnedBadges.Any())
            {
                await _userBadgeRepository.SaveAsync();
            }

            return newEarnedBadges;
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
                    Rarity = badge.Rarity,
                    IsEarned = earned != null,
                    EarnedDate = earned?.EarnedDate
                });
            }

            return result
                .OrderByDescending(b => b.IsEarned)
                .ThenByDescending(b => b.Rarity == "legendary")
                .ThenByDescending(b => b.Rarity == "epic")
                .ThenByDescending(b => b.Rarity == "rare")
                .ToList();
        }
    }
}