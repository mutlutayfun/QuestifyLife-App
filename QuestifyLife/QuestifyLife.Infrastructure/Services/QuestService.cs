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
                ColorCode = request.ColorCode ?? "#3498db"
            };

            await _questRepository.AddAsync(newQuest);
            await _questRepository.SaveAsync();

            return newQuest;
        }

        // --- 2. BEKLEYEN GÖREVLERİ GETİR (EKSİKSİZ EKLENDİ) ---
        public async Task<List<QuestDto>> GetPendingQuestsAsync(Guid userId)
        {
            var quests = await _questRepository
                .GetWhere(q => q.UserId == userId && !q.IsCompleted)
                .Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted
                })
                .ToListAsync();

            return quests;
        }

        // --- 3. GÖREV DURUMU DEĞİŞTİRME (TOGGLE) ---
        public async Task<OperationResultDto> ToggleQuestStatusAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null) return new OperationResultDto { IsSuccess = false, Message = "Görev bulunamadı." };

            // Güvenlik: Başkasının görevini değiştiremesin
            if (quest.UserId != userId) return new OperationResultDto { IsSuccess = false, Message = "Yetkisiz işlem." };

            var user = await _userRepository.GetByIdAsync(userId);

            // O günün performans kaydını bul
            var todayPerformance = await _dailyPerformanceRepository
                .GetWhere(p => p.UserId == userId && p.Date.Date == DateTime.UtcNow.Date)
                .FirstOrDefaultAsync();

            if (quest.IsCompleted)
            {
                // --- GERİ ALMA SENARYOSU (UNCHECK) ---
                quest.IsCompleted = false;
                quest.CompletedDate = null; // Artık hata vermeyecek

                // Puanları Düş
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
                // --- TAMAMLAMA SENARYOSU (CHECK) ---
                quest.IsCompleted = true;
                quest.CompletedDate = DateTime.UtcNow;

                // Puanları Ekle
                if (user != null) user.TotalXp += quest.RewardPoints;

                // Günlük Performans Yoksa Oluştur
                if (todayPerformance == null)
                {
                    todayPerformance = new DailyPerformance
                    {
                        UserId = userId,
                        Date = DateTime.UtcNow,
                        TotalPointsEarned = 0,
                        IsTargetReached = false
                        // IsDayClosed varsayılan false gelir
                    };
                    await _dailyPerformanceRepository.AddAsync(todayPerformance);
                }

                todayPerformance.TotalPointsEarned += quest.RewardPoints;
                _dailyPerformanceRepository.Update(todayPerformance);

                _questRepository.Update(quest);
                if (user != null) _userRepository.Update(user);

                await _questRepository.SaveAsync();

                // Rozet Kontrolü
                var newBadges = await _badgeService.CheckAndAwardBadgesAsync(quest.UserId);

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

        // --- 4. GÖREV GÜNCELLEME (EDIT) ---
        public async Task<bool> UpdateQuestAsync(UpdateQuestRequest request)
        {
            var quest = await _questRepository.GetByIdAsync(request.Id);
            if (quest == null) return false;

            if (quest.UserId != request.UserId) throw new Exception("Bu görevi düzenleme yetkiniz yok.");

            // Bilgileri Güncelle
            quest.Title = request.Title;
            quest.Description = request.Description;
            quest.Category = request.Category ?? "Genel";
            quest.RewardPoints = request.RewardPoints;

            _questRepository.Update(quest);
            await _questRepository.SaveAsync();

            return true;
        }

        // --- 5. GÖREV SİLME ---
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
