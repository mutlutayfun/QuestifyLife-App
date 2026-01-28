using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using QuestifyLife.Domain.Enums;
using QuestifyLife.Infrastructure.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
    public class QuestService : IQuestService
    {
        private readonly QuestifyLifeDbContext _context;
        private readonly IGenericRepository<Quest> _questRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IBadgeService _badgeService;
        private readonly IGenericRepository<DailyPerformance> _dailyPerformanceRepository;

        private const int MAX_QUEST_POINTS = 30;
        private const int MAX_DAILY_QUEST_COUNT = 50; // Günlük Maksimum Görev Sayısı

        public QuestService(
            QuestifyLifeDbContext context,
            IGenericRepository<Quest> questRepository,
            IGenericRepository<User> userRepository,
            IBadgeService badgeService,
            IGenericRepository<DailyPerformance> dailyPerformanceRepository)
        {
            _context = context;
            _questRepository = questRepository;
            _userRepository = userRepository;
            _badgeService = badgeService;
            _dailyPerformanceRepository = dailyPerformanceRepository;
        }

        public async Task<Quest> CreateQuestAsync(CreateQuestRequest request)
        {
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null) throw new ArgumentException("Kullanıcı bulunamadı!");

            if (request.RewardPoints > MAX_QUEST_POINTS)
                throw new ArgumentException($"Maksimum {MAX_QUEST_POINTS} XP sınırı aşıldı.");

            if (request.RewardPoints <= 0)
                throw new ArgumentException("Puan geçersiz.");

            // Tarih kontrolü - Local TR saatine göre normalize et
            DateTime scheduledDate = request.ScheduledDate ?? DateTime.UtcNow.AddHours(3);
            var targetDateOnly = scheduledDate.Date;

            // UTC Aralığı hesaplama (TR Saati 00:00 - 23:59 arası)
            var dayStartUtc = targetDateOnly.AddHours(-3);
            var dayEndUtc = targetDateOnly.AddDays(1).AddHours(-3).AddTicks(-1);

            // GÜNÜN KAPALI OLMA KONTROLÜ
            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId &&
                d.Date >= dayStartUtc && d.Date <= dayEndUtc &&
                d.IsDayClosed
              ).AnyAsync();

            // Sadece "Bugün" için kilit kontrolü yap (Gelecek planlamayı engelleme)
            var trNow = DateTime.UtcNow.AddHours(3).Date;
            if (isDayClosed && targetDateOnly <= trNow)
                throw new InvalidOperationException("Bu gün başarıyla tamamlandı ve kilitlendi! Yeni planlarını yarın için yapmalısın. 🌙");

            // --- DEĞİŞİKLİK: XP LİMİT KONTROLÜ KALDIRILDI, GÖREV SAYISI LİMİTİ EKLENDİ ---

            // Günlük görev sayısı kontrolü
            var dailyQuestCount = await _questRepository
                .GetWhere(q => q.UserId == request.UserId && q.ScheduledDate >= dayStartUtc && q.ScheduledDate <= dayEndUtc)
                .CountAsync();

            if (dailyQuestCount >= MAX_DAILY_QUEST_COUNT)
            {
                throw new InvalidOperationException($"Günlük maksimum {MAX_DAILY_QUEST_COUNT} görev ekleyebilirsiniz.");
            }

            // (Eski XP kontrol bloğu tamamen kaldırıldı çünkü planlamada sınır yok)

            var newQuest = new Quest
            {
                UserId = request.UserId,
                Title = request.Title,
                Description = request.Description,
                RewardPoints = request.RewardPoints,
                ScheduledDate = scheduledDate,
                IsCompleted = false,
                Category = request.Category ?? "Genel",
                ColorCode = request.ColorCode ?? "#3498db",
                ReminderDate = request.ReminderDate
            };

            await _questRepository.AddAsync(newQuest);
            await _questRepository.SaveAsync();

            return newQuest;
        }

        public async Task<List<QuestDto>> GetPendingQuestsAsync(Guid userId, DateTime? date = null)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.AddHours(3).Date;
            var dayStartUtc = targetDate.AddHours(-3);
            var dayEndUtc = targetDate.AddDays(1).AddHours(-3).AddTicks(-1);

            return await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate >= dayStartUtc && q.ScheduledDate <= dayEndUtc)
                .Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted,
                    IsPinned = q.IsPinned,
                    ColorCode = q.ColorCode,
                    Category = q.Category,
                    ScheduledDate = q.ScheduledDate,
                    ReminderDate = q.ReminderDate
                })
                .ToListAsync();
        }

        public async Task<List<QuestDto>> GetPinnedTemplatesAsync(Guid userId)
        {
            return await _questRepository
                .GetWhere(q => q.UserId == userId && q.IsPinned)
                .OrderByDescending(q => q.CreatedDate)
                .GroupBy(q => q.Title)
                .Select(g => g.First())
                .Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    Category = q.Category,
                    ColorCode = q.ColorCode,
                    IsPinned = true
                }).ToListAsync();
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
            try
            {
                var quest = await _questRepository.GetByIdAsync(questId);
                if (quest == null || quest.UserId != userId) return new OperationResultDto { IsSuccess = false, Message = "Erişim engellendi." };

                var trNow = DateTime.UtcNow.AddHours(3).Date;
                var dayStartUtc = trNow.AddHours(-3);
                var dayEndUtc = trNow.AddDays(1).AddHours(-3).AddTicks(-1);

                var isClosed = await _dailyPerformanceRepository.GetWhere(p => p.UserId == userId && p.Date >= dayStartUtc && p.Date <= dayEndUtc && p.IsDayClosed).AnyAsync();
                if (isClosed) return new OperationResultDto { IsSuccess = false, Message = "Gün kapandığı için durum değiştiremezsin." };

                quest.IsCompleted = !quest.IsCompleted;
                quest.CompletedDate = quest.IsCompleted ? DateTime.UtcNow.AddHours(3) : null;

                _questRepository.Update(quest);
                await _questRepository.SaveAsync();

                return new OperationResultDto { IsSuccess = true, IsCompleted = quest.IsCompleted, Message = "Güncellendi" };
            }
            catch (Exception ex)
            {
                return new OperationResultDto { IsSuccess = false, Message = ex.Message };
            }
        }

        public async Task<bool> UpdateQuestAsync(UpdateQuestRequest request)
        {
            var quest = await _questRepository.GetByIdAsync(request.Id);
            if (quest == null || quest.UserId != request.UserId) throw new UnauthorizedAccessException();

            quest.Title = request.Title;
            quest.Description = request.Description;
            quest.RewardPoints = request.RewardPoints;

            _questRepository.Update(quest);
            await _questRepository.SaveAsync();
            return true;
        }

        public async Task<bool> DeleteQuestAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null || quest.UserId != userId) return false;
            await _questRepository.RemoveAsync(questId);
            await _questRepository.SaveAsync();
            return true;
        }
    }
}