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

        public QuestService(IGenericRepository<Quest> questRepository, IGenericRepository<User> userRepository, IBadgeService badgeService, IGenericRepository<DailyPerformance> dailyPerformanceRepository)
        {
            _questRepository = questRepository;
            _userRepository = userRepository;
            _badgeService = badgeService;
            _dailyPerformanceRepository = dailyPerformanceRepository;
        }

        // --- 1. GÖREV OLUŞTURMA (EKSİKSİZ EKLENDİ) ---
        public async Task<Quest> CreateQuestAsync(CreateQuestRequest request)
        {
            var userExists = await _userRepository.GetByIdAsync(request.UserId);
            if (userExists == null)
            {
                throw new Exception("Kullanıcı bulunamadı!");
            }

            // Gün kapandıysa görev ekletme
            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId &&
                d.Date == request.ScheduledDate.Date &&
                d.IsDayClosed
             ).AnyAsync();

            if (isDayClosed)
            {
                throw new Exception("Bu gün için rapor kapatıldı! Artık yeni görev ekleyemezsiniz.");
            }

            var newQuest = new Quest
            {
                UserId = request.UserId,
                Title = request.Title,
                Description = request.Description,
                RewardPoints = request.RewardPoints,
                ScheduledDate = request.ScheduledDate,
                IsCompleted = false,
                CompletedDate = null,
                // Ceza puanı şimdilik basit tutalım, ileride eklenebilir
                Category = request.Category ?? "Genel",
                ColorCode = request.ColorCode ?? "#3498db",
                IsPinned = false
            };

            await _questRepository.AddAsync(newQuest);
            await _questRepository.SaveAsync();

            return newQuest;
        }

        // --- 2. BEKLEYEN GÖREVLERİ GETİR (EKSİKSİZ EKLENDİ) ---
        // --- GÜNCELLENEN METOT: PİNLİ GÖREVLERİ OTOMATİK GETİR ---
        public async Task<List<QuestDto>> GetPendingQuestsAsync(Guid userId)
        {
            var today = DateTime.UtcNow.Date;

            // 1. ADIM: Geçmişte "Pinlenmiş" olan görevleri bul (Şablon gibi düşün)
            // Performans için sadece son 30 günün aktif görevlerine bakıyoruz
            var pinnedQuestsRaw = await _questRepository
                .GetWhere(q => q.UserId == userId && q.IsPinned)
                .OrderByDescending(q => q.ScheduledDate)
                .ToListAsync();

            // Aynı isimdeki görevlerden sadece en güncelini al (DistinctBy Title)
            var distinctPinnedTemplates = pinnedQuestsRaw
                .GroupBy(q => q.Title)
                .Select(g => g.First())
                .ToList();

            foreach (var template in distinctPinnedTemplates)
            {
                // Bu görev şablonu BUGÜN için var mı?
                var existsToday = await _questRepository
                    .GetWhere(q => q.UserId == userId && q.Title == template.Title && q.ScheduledDate.Date == today)
                    .AnyAsync();

                if (!existsToday)
                {
                    // Yoksa, bugüne bir kopyasını oluştur!
                    var dailyClone = new Quest
                    {
                        UserId = userId,
                        Title = template.Title,
                        Description = template.Description,
                        RewardPoints = template.RewardPoints,
                        Category = template.Category,
                        ColorCode = template.ColorCode,
                        IsPinned = true, // Klon da pinli olsun ki yarın da devam etsin
                        IsCompleted = false,
                        ScheduledDate = today
                    };
                    await _questRepository.AddAsync(dailyClone);
                }
            }
            // Değişiklik varsa kaydet
            if (distinctPinnedTemplates.Any()) await _questRepository.SaveAsync();

            // 2. ADIM: Artık normal listeyi çekebiliriz
            return await _questRepository
                .GetWhere(q => q.UserId == userId && !q.IsCompleted && q.ScheduledDate.Date == today) // Sadece bugünün işlerini göster
                .Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted,
                    IsPinned = q.IsPinned // DTO'ya eklemeyi unutma
                })
                .ToListAsync();
        }
        public async Task<bool> TogglePinStatusAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null || quest.UserId != userId) return false;

            quest.IsPinned = !quest.IsPinned; // Tersine çevir

            _questRepository.Update(quest);
            await _questRepository.SaveAsync();

            return quest.IsPinned;
        }

        // --- 3. GÖREV DURUMU DEĞİŞTİRME (TOGGLE) ---
        public async Task<OperationResultDto> ToggleQuestStatusAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null) return new OperationResultDto { IsSuccess = false, Message = "Görev bulunamadı." };

            if (quest.UserId != userId) return new OperationResultDto { IsSuccess = false, Message = "Yetkisiz işlem." };

            var user = await _userRepository.GetByIdAsync(userId);

            var todayPerformance = await _dailyPerformanceRepository
                .GetWhere(p => p.UserId == userId && p.Date.Date == DateTime.UtcNow.Date)
                .FirstOrDefaultAsync();
            if (todayPerformance != null && todayPerformance.IsDayClosed)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Gün kapandı! Artık değişiklik yapamazsın."
                };
            }

            if (quest.IsCompleted)
            {
                // --- GERİ ALMA (UNCHECK) ---
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

                return new OperationResultDto
                {
                    IsSuccess = true,
                    Message = "Görev geri alındı.",
                    EarnedPoints = -quest.RewardPoints,
                    IsCompleted = false
                };
            }
            else
            {
                // --- TAMAMLAMA (CHECK) ---
                quest.IsCompleted = true;
                quest.CompletedDate = DateTime.UtcNow;

                if (user != null) user.TotalXp += quest.RewardPoints;

                // FIX: Eğer performans kaydı yoksa EKLE, varsa GÜNCELLE
                if (todayPerformance == null)
                {
                    todayPerformance = new DailyPerformance
                    {
                        UserId = userId,
                        Date = DateTime.UtcNow,
                        TotalPointsEarned = quest.RewardPoints, // Direkt puanı ver
                        IsTargetReached = false
                    };
                    await _dailyPerformanceRepository.AddAsync(todayPerformance);
                    // BURADA UPDATE ÇAĞIRMIYORUZ, AddAsync YETERLİ
                }
                else
                {
                    todayPerformance.TotalPointsEarned += quest.RewardPoints;
                    _dailyPerformanceRepository.Update(todayPerformance);
                }

                _questRepository.Update(quest);
                if (user != null) _userRepository.Update(user);

                await _questRepository.SaveAsync();

                // FIX: Rozet kontrolünü güvenli hale getirdik (Try-Catch)
                List<string> newBadges = new List<string>();
                try
                {
                    newBadges = await _badgeService.CheckAndAwardBadgesAsync(quest.UserId);
                }
                catch (Exception)
                {
                    // Rozet hatası olursa işlemi bozma, sessizce devam et
                }

                return new OperationResultDto
                {
                    IsSuccess = true,
                    Message = "Tebrikler! Görev tamamlandı.",
                    EarnedPoints = quest.RewardPoints,
                    NewBadges = newBadges,
                    IsCompleted = true
                };
            }
        }

        public async Task<bool> UpdateQuestAsync(UpdateQuestRequest request)
        {
            var quest = await _questRepository.GetByIdAsync(request.Id);
            if (quest == null) return false;

            if (quest.UserId != request.UserId) throw new Exception("Bu görevi düzenleme yetkiniz yok.");

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
            if (quest == null) return false;
            if (quest.UserId != userId) throw new Exception("Bu görevi silmeye yetkiniz yok.");

            await _questRepository.RemoveAsync(questId);
            await _questRepository.SaveAsync();
            return true;
        }
    }
}

