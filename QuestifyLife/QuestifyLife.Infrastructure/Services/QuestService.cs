using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

        public async Task<Quest> CreateQuestAsync(CreateQuestRequest request)
        {

            var userExists = await _userRepository.GetByIdAsync(request.UserId);
            if (userExists == null)
            {
                throw new Exception("Kullanıcı bulunamadı! Lütfen geçerli bir UserId giriniz.");
            }
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
                PenaltyPoints = -(request.RewardPoints / 2),
                Category = request.Category ?? "Genel",     // Null gelirse varsayılan ata
                ColorCode = request.ColorCode ?? "#3498db"
            };

            await _questRepository.AddAsync(newQuest);
            await _questRepository.SaveAsync();

            return newQuest;
        }

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

        public async Task<OperationResultDto> CompleteQuestAsync(Guid questId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null) return new OperationResultDto { IsSuccess = false, Message = "Görev bulunamadı." };

            if (quest.IsCompleted)
                return new OperationResultDto { IsSuccess = true, Message = "Zaten tamamlanmış." };

            // 1. Görevi tamamla
            quest.IsCompleted = true;
            _questRepository.Update(quest);

            // 2. Puan ver
            var user = await _userRepository.GetByIdAsync(quest.UserId);
            if (user != null)
            {
                user.TotalXp += quest.RewardPoints;
                _userRepository.Update(user);
            }

            await _questRepository.SaveAsync();

            // 3. ROZET KONTROLÜ (YENİ KISIM)
            // BadgeService bize yeni kazanılanları liste olarak dönecek
            var newBadges = await _badgeService.CheckAndAwardBadgesAsync(quest.UserId);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Tebrikler! Görev tamamlandı.",
                EarnedPoints = quest.RewardPoints,
                NewBadges = newBadges // Kazanılan rozetleri pakete koy
            };
        }
        public async Task<bool> DeleteQuestAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);

            // Görev yoksa işlem yapma
            if (quest == null) return false;

            // Senior Kontrolü: Başkasının görevini silmeye çalışıyorsa hata ver!
            if (quest.UserId != userId) throw new Exception("Bu görevi silmeye yetkiniz yok.");

            await _questRepository.RemoveAsync(questId);
            await _questRepository.SaveAsync();
            return true;
        }
    }
}