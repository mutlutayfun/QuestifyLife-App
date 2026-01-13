using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
    public class QuestService : IQuestService
    {
        private readonly IGenericRepository<Quest> _questRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IBadgeService _badgeService;
        private readonly IGenericRepository<DailyPerformance> _dailyPerformanceRepository;

        // Sabitler: Puan Sınırları
        private const int MAX_QUEST_POINTS = 30; // Bir görevden en fazla bu kadar puan alınabilir

        public QuestService(
            IGenericRepository<Quest> questRepository,
            IGenericRepository<User> userRepository,
            IBadgeService badgeService,
            IGenericRepository<DailyPerformance> dailyPerformanceRepository)
        {
            _questRepository = questRepository;
            _userRepository = userRepository;
            _badgeService = badgeService;
            _dailyPerformanceRepository = dailyPerformanceRepository;
        }

        public async Task<Quest> CreateQuestAsync(CreateQuestRequest request)
        {
            var userExists = await _userRepository.GetByIdAsync(request.UserId);
            if (userExists == null) throw new Exception("Kullanıcı bulunamadı!");

            // --- GÜVENLİK KONTROLÜ: PUAN SINIRI ---
            if (request.RewardPoints > MAX_QUEST_POINTS)
            {
                throw new Exception($"Bir görev en fazla {MAX_QUEST_POINTS} XP değerinde olabilir. Lütfen daha küçük parçalara böl.");
            }
            if (request.RewardPoints <= 0)
            {
                throw new Exception("Puan 0'dan büyük olmalıdır.");
            }

            var trTime = DateTime.UtcNow.AddHours(3);

            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId &&
                d.Date.Date == request.ScheduledDate.Date &&
                d.IsDayClosed
             ).AnyAsync();

            if (isDayClosed) throw new Exception("Bu gün için rapor kapatıldı! Artık yeni görev ekleyemezsiniz.");

            var newQuest = new Quest
            {
                UserId = request.UserId,
                Title = request.Title,
                Description = request.Description,
                RewardPoints = request.RewardPoints,
                ScheduledDate = request.ScheduledDate,
                IsCompleted = false,
                CompletedDate = null,
                Category = request.Category ?? "Genel",
                ColorCode = request.ColorCode ?? "#3498db",
                IsPinned = false
            };

            await _questRepository.AddAsync(newQuest);
            await _questRepository.SaveAsync();

            return newQuest;
        }

        public async Task<List<QuestDto>> GetPendingQuestsAsync(Guid userId)
        {
            var trTime = DateTime.UtcNow.AddHours(3);
            var today = trTime.Date;
            var yesterday = today.AddDays(-1);

            // CEZA KONTROLÜ
            var yesterdayPerformance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date.Date == yesterday)
                .FirstOrDefaultAsync();

            if (yesterdayPerformance != null && !yesterdayPerformance.IsDayClosed)
            {
                yesterdayPerformance.IsDayClosed = true;
                _dailyPerformanceRepository.Update(yesterdayPerformance);

                var user = await _userRepository.GetByIdAsync(userId);
                if (user != null)
                {
                    user.TotalXp -= 50;
                    if (user.TotalXp < 0) user.TotalXp = 0;
                    _userRepository.Update(user);
                }
                await _userRepository.SaveAsync();
            }

            // PİNLEME KONTROLÜ
            var isTodayClosed = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date.Date == today && d.IsDayClosed)
                .AnyAsync();

            if (!isTodayClosed)
            {
                var allPinnedQuests = await _questRepository
                    .GetWhere(q => q.UserId == userId && q.IsPinned)
                    .OrderByDescending(q => q.ScheduledDate)
                    .ToListAsync();

                var uniquePinnedTemplates = allPinnedQuests
                    .GroupBy(q => q.Title)
                    .Select(g => g.First())
                    .ToList();

                bool changesMade = false;

                foreach (var template in uniquePinnedTemplates)
                {
                    var existsToday = await _questRepository
                        .GetWhere(q => q.UserId == userId && q.Title == template.Title && q.ScheduledDate.Date == today)
                        .AnyAsync();

                    if (!existsToday)
                    {
                        var dailyClone = new Quest
                        {
                            UserId = userId,
                            Title = template.Title,
                            Description = template.Description,
                            RewardPoints = template.RewardPoints,
                            Category = template.Category,
                            ColorCode = template.ColorCode,
                            IsPinned = true,
                            IsCompleted = false,
                            ScheduledDate = today,
                            CompletedDate = null
                        };
                        await _questRepository.AddAsync(dailyClone);
                        changesMade = true;
                    }
                }
                if (changesMade) await _questRepository.SaveAsync();
            }

            return await _questRepository
                .GetWhere(q => q.UserId == userId && !q.IsCompleted && q.ScheduledDate.Date == today)
                .Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted,
                    IsPinned = q.IsPinned
                })
                .ToListAsync();
        }

        public async Task<bool> TogglePinStatusAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null || quest.UserId != userId) return false;

            quest.IsPinned = !quest.IsPinned;

            _questRepository.Update(quest);
            await _questRepository.SaveAsync();

            return quest.IsPinned;
        }

        public async Task<OperationResultDto> ToggleQuestStatusAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null) return new OperationResultDto { IsSuccess = false, Message = "Görev bulunamadı." };
            if (quest.UserId != userId) return new OperationResultDto { IsSuccess = false, Message = "Yetkisiz işlem." };

            var trTime = DateTime.UtcNow.AddHours(3);

            var user = await _userRepository.GetByIdAsync(userId);
            var todayPerformance = await _dailyPerformanceRepository
                .GetWhere(p => p.UserId == userId && p.Date.Date == trTime.Date)
                .FirstOrDefaultAsync();

            if (todayPerformance != null && todayPerformance.IsDayClosed)
                return new OperationResultDto { IsSuccess = false, Message = "Gün kapandı! Değişiklik yapılamaz." };

            if (quest.IsCompleted)
            {
                quest.IsCompleted = false;
                quest.CompletedDate = null;

                if (user != null) user.TotalXp -= quest.RewardPoints;

                if (todayPerformance != null)
                {
                    todayPerformance.TotalPointsEarned -= quest.RewardPoints;
                    _dailyPerformanceRepository.Update(todayPerformance);
                }

                _questRepository.Update(quest);
                if (user != null) _userRepository.Update(user);
                await _questRepository.SaveAsync();

                return new OperationResultDto { IsSuccess = true, Message = "Geri alındı.", EarnedPoints = -quest.RewardPoints, IsCompleted = false };
            }
            else
            {
                quest.IsCompleted = true;
                quest.CompletedDate = trTime;

                if (user != null) user.TotalXp += quest.RewardPoints;

                if (todayPerformance == null)
                {
                    todayPerformance = new DailyPerformance
                    {
                        UserId = userId,
                        Date = trTime,
                        TotalPointsEarned = quest.RewardPoints
                    };
                    await _dailyPerformanceRepository.AddAsync(todayPerformance);
                }
                else
                {
                    todayPerformance.TotalPointsEarned += quest.RewardPoints;
                    _dailyPerformanceRepository.Update(todayPerformance);
                }

                _questRepository.Update(quest);
                if (user != null) _userRepository.Update(user);
                await _questRepository.SaveAsync();

                List<string> newBadges = new List<string>();
                try
                {
                    newBadges = await _badgeService.CheckAndAwardBadgesAsync(quest.UserId);
                }
                catch { }

                return new OperationResultDto { IsSuccess = true, Message = "Tamamlandı!", EarnedPoints = quest.RewardPoints, NewBadges = newBadges, IsCompleted = true };
            }
        }

        public async Task<bool> UpdateQuestAsync(UpdateQuestRequest request)
        {
            var quest = await _questRepository.GetByIdAsync(request.Id);
            if (quest == null || quest.UserId != request.UserId) return false;

            // --- GÜVENLİK KONTROLÜ: GÜNCELLEMEDE DE PUAN SINIRI ---
            if (request.RewardPoints > MAX_QUEST_POINTS) return false;

            var trTime = DateTime.UtcNow.AddHours(3);

            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId && d.Date.Date == trTime.Date && d.IsDayClosed).AnyAsync();
            if (isDayClosed) return false;

            quest.Title = request.Title;
            quest.Description = request.Description;
            quest.Category = request.Category ?? "Genel";
            quest.RewardPoints = request.RewardPoints;
            quest.IsPinned = request.IsPinned;

            _questRepository.Update(quest);
            await _questRepository.SaveAsync();
            return true;
        }

        public async Task<bool> DeleteQuestAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null || quest.UserId != userId) return false;

            var trTime = DateTime.UtcNow.AddHours(3);

            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
               d.UserId == userId && d.Date.Date == trTime.Date && d.IsDayClosed).AnyAsync();
            if (isDayClosed) throw new Exception("Gün kapandı, silme işlemi yapılamaz.");

            await _questRepository.RemoveAsync(questId);
            await _questRepository.SaveAsync();
            return true;
        }
    }
}