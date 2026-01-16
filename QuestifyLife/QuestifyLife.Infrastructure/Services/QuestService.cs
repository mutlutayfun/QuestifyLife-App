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
            if (user == null) throw new Exception("Kullanıcı bulunamadı!");

            if (request.RewardPoints > MAX_QUEST_POINTS)
            {
                throw new Exception($"Bir görev için en fazla {MAX_QUEST_POINTS} XP kazanabilirsin. Lütfen puanı düşür.");
            }
            if (request.RewardPoints <= 0) throw new Exception("Puan 0'dan büyük olmalıdır.");

            // TARİH KONTROLÜ
            DateTime scheduledDate;
            if (request.ScheduledDate.HasValue)
            {
                scheduledDate = request.ScheduledDate.Value;
            }
            else
            {
                // Varsayılan: Türkiye Saati
                scheduledDate = DateTime.UtcNow.AddHours(3);
            }

            // UTC Zaman Aralığı Hesaplama (TR Saatine göre gün sınırları)
            var targetDate = scheduledDate.Date;
            var dayStartUtc = targetDate.AddHours(-3);
            var dayEndUtc = targetDate.AddDays(1).AddHours(-3).AddTicks(-1);

            // 1. GÜN KAPALI KONTROLÜ
            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId &&
                d.Date >= dayStartUtc && d.Date <= dayEndUtc &&
                d.IsDayClosed
              ).AnyAsync();

            if (isDayClosed) throw new Exception("Bu gün zaten tamamlandı! Artık yeni görev ekleyemezsin.");

            // 2. GÜNLÜK PUAN LİMİTİ KONTROLÜ
            var existingTotalPoints = await _questRepository
                .GetWhere(q => q.UserId == request.UserId && q.ScheduledDate >= dayStartUtc && q.ScheduledDate <= dayEndUtc)
                .SumAsync(q => q.RewardPoints);

            // Eğer yeni görevle birlikte limit aşılıyorsa hata fırlat
            if (existingTotalPoints + request.RewardPoints > user.DailyTargetPoints)
            {
                int remainingPoints = user.DailyTargetPoints - existingTotalPoints;
                // Kalan puan negatif ise 0 göster
                remainingPoints = remainingPoints < 0 ? 0 : remainingPoints;

                throw new Exception($"Günlük hedefini ({user.DailyTargetPoints} XP) aşıyorsun! Şu an sadece {remainingPoints} XP'lik daha görev ekleyebilirsin.");
            }

            var newQuest = new Quest
            {
                UserId = request.UserId,
                Title = request.Title,
                Description = request.Description,
                RewardPoints = request.RewardPoints,
                ScheduledDate = scheduledDate,
                IsCompleted = false,
                CompletedDate = null,
                Category = request.Category ?? "Genel",
                ColorCode = request.ColorCode ?? "#3498db",
                IsPinned = false,

                // YENİ: Hatırlatıcı tarihini ekle
                ReminderDate = request.ReminderDate
            };

            await _questRepository.AddAsync(newQuest);
            await _questRepository.SaveAsync();

            return newQuest;
        }

        public async Task<List<QuestDto>> GetPendingQuestsAsync(Guid userId, DateTime? date = null)
        {
            var targetDate = date.HasValue ? date.Value.Date : DateTime.UtcNow.AddHours(3).Date;

            var dayStartUtc = targetDate.AddHours(-3);
            var dayEndUtc = targetDate.AddDays(1).AddHours(-3).AddTicks(-1);

            var trNow = DateTime.UtcNow.AddHours(3).Date;
            if (targetDate == trNow)
            {
                var yesterdayTr = trNow.AddDays(-1);
                var yesterdayStartUtc = yesterdayTr.AddHours(-3);
                var yesterdayEndUtc = yesterdayTr.AddDays(1).AddHours(-3).AddTicks(-1);

                var yesterdayPerformance = await _dailyPerformanceRepository
                    .GetWhere(d => d.UserId == userId && d.Date >= yesterdayStartUtc && d.Date <= yesterdayEndUtc)
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
            }

            return await _questRepository
                .GetWhere(q => q.UserId == userId &&
                               q.ScheduledDate >= dayStartUtc && q.ScheduledDate <= dayEndUtc)
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
                    // YENİ: DTO'ya hatırlatıcı tarihini ekle
                    ReminderDate = q.ReminderDate
                })
                .ToListAsync();
        }

        public async Task<List<QuestDto>> GetPinnedTemplatesAsync(Guid userId)
        {
            var allPinned = await _questRepository
                .GetWhere(q => q.UserId == userId && q.IsPinned)
                .OrderByDescending(q => q.CreatedDate)
                .ToListAsync();

            var uniqueTemplates = allPinned
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
                    IsPinned = true,
                    // Şablonlarda hatırlatıcı genelde olmaz ama varsa da ekleyelim
                    ReminderDate = q.ReminderDate
                })
                .ToList();

            return uniqueTemplates;
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var quest = await _questRepository.GetByIdAsync(questId);
                if (quest == null) return new OperationResultDto { IsSuccess = false, Message = "Görev bulunamadı." };
                if (quest.UserId != userId) return new OperationResultDto { IsSuccess = false, Message = "Bu görevi değiştirmeye yetkin yok." };

                var trTime = DateTime.UtcNow.AddHours(3);
                var todayTr = trTime.Date;

                var todayStartUtc = todayTr.AddHours(-3);
                var todayEndUtc = todayTr.AddDays(1).AddHours(-3).AddTicks(-1);

                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null) return new OperationResultDto { IsSuccess = false, Message = "Kullanıcı bulunamadı." };

                var todayPerformance = await _dailyPerformanceRepository
                    .GetWhere(p => p.UserId == userId && p.Date >= todayStartUtc && p.Date <= todayEndUtc)
                    .FirstOrDefaultAsync();

                if (todayPerformance != null && todayPerformance.IsDayClosed)
                    return new OperationResultDto { IsSuccess = false, Message = "Bugün tamamlandı! Artık değişiklik yapamazsın." };

                bool isLevelUp = false;
                int pointsChange = 0;

                if (quest.IsCompleted)
                {
                    quest.IsCompleted = false;
                    quest.CompletedDate = null;
                    pointsChange = -quest.RewardPoints;

                    user.TotalXp += pointsChange;
                    if (user.TotalXp < 0) user.TotalXp = 0;

                    if (todayPerformance != null)
                    {
                        todayPerformance.TotalPointsEarned += pointsChange;
                        if (todayPerformance.TotalPointsEarned < 0) todayPerformance.TotalPointsEarned = 0;
                        _dailyPerformanceRepository.Update(todayPerformance);
                    }
                }
                else
                {
                    quest.IsCompleted = true;
                    quest.CompletedDate = trTime;
                    pointsChange = quest.RewardPoints;

                    user.TotalXp += pointsChange;

                    int calculatedLevel = (user.TotalXp / 1000) + 1;
                    if (calculatedLevel > user.Level)
                    {
                        user.Level = calculatedLevel;
                        isLevelUp = true;
                    }

                    if (todayPerformance == null)
                    {
                        todayPerformance = new DailyPerformance
                        {
                            UserId = userId,
                            Date = todayTr,
                            TotalPointsEarned = pointsChange
                        };
                        await _dailyPerformanceRepository.AddAsync(todayPerformance);
                    }
                    else
                    {
                        todayPerformance.TotalPointsEarned += pointsChange;
                        _dailyPerformanceRepository.Update(todayPerformance);
                    }
                }

                _questRepository.Update(quest);
                _userRepository.Update(user);
                await _questRepository.SaveAsync();

                List<string> newBadges = new List<string>();
                if (quest.IsCompleted)
                {
                    try
                    {
                        newBadges = await _badgeService.CheckAndAwardBadgesAsync(quest.UserId);
                    }
                    catch { }
                }

                await transaction.CommitAsync();

                string msg = quest.IsCompleted ? "Tamamlandı!" : "Geri alındı.";
                if (isLevelUp) msg += $" TEBRİKLER! LEVEL {user.Level} OLDUN!";

                return new OperationResultDto
                {
                    IsSuccess = true,
                    Message = msg,
                    EarnedPoints = pointsChange,
                    NewBadges = newBadges,
                    IsCompleted = quest.IsCompleted
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new OperationResultDto { IsSuccess = false, Message = $"Hata: {ex.Message}" };
            }
        }

        public async Task<bool> UpdateQuestAsync(UpdateQuestRequest request)
        {
            var quest = await _questRepository.GetByIdAsync(request.Id);
            if (quest == null || quest.UserId != request.UserId) throw new Exception("Görev bulunamadı veya yetkin yok.");
            if (request.RewardPoints > MAX_QUEST_POINTS) throw new Exception($"Bir görev en fazla {MAX_QUEST_POINTS} XP olabilir.");

            // Zaman ayarları
            var targetDate = quest.ScheduledDate.Date;
            var dayStartUtc = targetDate.AddHours(-3);
            var dayEndUtc = targetDate.AddDays(1).AddHours(-3).AddTicks(-1);

            // 1. Gün Kapalı Mı?
            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId &&
                d.Date >= dayStartUtc && d.Date <= dayEndUtc &&
                d.IsDayClosed).AnyAsync();

            if (isDayClosed) throw new Exception("Bu gün kapandı, değişiklik yapamazsın.");

            // 2. Günlük Limit Kontrolü (Update için)
            if (request.RewardPoints > quest.RewardPoints)
            {
                var user = await _userRepository.GetByIdAsync(request.UserId);

                var existingTotalPoints = await _questRepository
                    .GetWhere(q => q.UserId == request.UserId && q.ScheduledDate >= dayStartUtc && q.ScheduledDate <= dayEndUtc)
                    .SumAsync(q => q.RewardPoints);

                // Formül: (Mevcut Toplam - Eski Puan + Yeni Puan) > Hedef
                int newTotal = existingTotalPoints - quest.RewardPoints + request.RewardPoints;
                if (newTotal > user.DailyTargetPoints)
                {
                    throw new Exception($"Günlük hedefini ({user.DailyTargetPoints} XP) aşıyorsun! Bu değişiklikle toplam puan {newTotal} XP oluyor.");
                }
            }

            quest.Title = request.Title;
            quest.Description = request.Description;
            quest.Category = request.Category ?? "Genel";
            quest.RewardPoints = request.RewardPoints;
            quest.IsPinned = request.IsPinned;

            // YENİ: Hatırlatıcı tarihini güncelle
            quest.ReminderDate = request.ReminderDate;

            _questRepository.Update(quest);
            await _questRepository.SaveAsync();
            return true;
        }

        public async Task<bool> DeleteQuestAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null || quest.UserId != userId) return false;

            var targetDate = quest.ScheduledDate.Date;
            var dayStartUtc = targetDate.AddHours(-3);
            var dayEndUtc = targetDate.AddDays(1).AddHours(-3).AddTicks(-1);

            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
               d.UserId == userId &&
               d.Date >= dayStartUtc && d.Date <= dayEndUtc &&
               d.IsDayClosed).AnyAsync();

            if (isDayClosed) throw new Exception("Bu gün kapandı, görev silemezsin.");

            await _questRepository.RemoveAsync(questId);
            await _questRepository.SaveAsync();
            return true;
        }
    }
}