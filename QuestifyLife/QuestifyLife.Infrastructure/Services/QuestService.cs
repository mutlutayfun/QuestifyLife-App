using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
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

        // Sabitler: Puan Sınırları
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
            var userExists = await _userRepository.GetByIdAsync(request.UserId);
            if (userExists == null) throw new Exception("Kullanıcı bulunamadı!");

            if (request.RewardPoints > MAX_QUEST_POINTS)
            {
                throw new Exception($"Bir görev en fazla {MAX_QUEST_POINTS} XP değerinde olabilir.");
            }
            if (request.RewardPoints <= 0) throw new Exception("Puan 0'dan büyük olmalıdır.");

            // --- TÜRKİYE SAATİ AYARI (UTC+3) ---
            var trTime = DateTime.UtcNow.AddHours(3);
            var todayTr = trTime.Date;

            var todayStartUtc = todayTr.AddHours(-3);
            var todayEndUtc = todayTr.AddDays(1).AddHours(-3).AddTicks(-1);

            // GÜN KAPALI MI KONTROL ET
            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId &&
                d.Date >= todayStartUtc && d.Date <= todayEndUtc &&
                d.IsDayClosed
             ).AnyAsync();

            if (isDayClosed) throw new Exception("Bu gün için rapor kapatıldı! Artık yeni görev ekleyemezsiniz.");

            var newQuest = new Quest
            {
                UserId = request.UserId,
                Title = request.Title,
                Description = request.Description,
                RewardPoints = request.RewardPoints,
                ScheduledDate = trTime, // TR Saatiyle kaydet
                IsCompleted = false,
                CompletedDate = null,
                Category = request.Category ?? "Genel",
                ColorCode = request.ColorCode ?? "#3498db",
                IsPinned = false // Yeni eklenen görev varsayılan olarak pinli değil
            };

            await _questRepository.AddAsync(newQuest);
            await _questRepository.SaveAsync();

            return newQuest;
        }

        // --- GÜNCEL GÖREVLER (Sadece Bugünü Getir) ---
        public async Task<List<QuestDto>> GetPendingQuestsAsync(Guid userId)
        {
            // 1. ZAMAN AYARLAMASI (TRT - UTC+3)
            var trTime = DateTime.UtcNow.AddHours(3);
            var todayTr = trTime.Date;
            var yesterdayTr = todayTr.AddDays(-1);

            var todayStartUtc = todayTr.AddHours(-3);
            var todayEndUtc = todayTr.AddDays(1).AddHours(-3).AddTicks(-1);
            var yesterdayStartUtc = yesterdayTr.AddHours(-3);
            var yesterdayEndUtc = yesterdayTr.AddDays(1).AddHours(-3).AddTicks(-1);

            // 2. CEZA KONTROLÜ (Dün kapatılmadıysa kapat)
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

            // 3. LİSTELEME (Sadece BUGÜNE ait aktif görevler)
            return await _questRepository
                .GetWhere(q => q.UserId == userId && !q.IsCompleted &&
                               q.ScheduledDate >= todayStartUtc && q.ScheduledDate <= todayEndUtc)
                .Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted,
                    IsPinned = q.IsPinned,
                    ColorCode = q.ColorCode,
                    Category = q.Category
                })
                .ToListAsync();
        }

        // --- YENİ: PİNLENENLERİ (ŞABLONLARI) GETİR ---
        public async Task<List<QuestDto>> GetPinnedTemplatesAsync(Guid userId)
        {
            // Kullanıcının tüm pinli görevlerini çek
            var allPinned = await _questRepository
                .GetWhere(q => q.UserId == userId && q.IsPinned)
                .OrderByDescending(q => q.CreatedDate)
                .ToListAsync();

            // Bellekte gruplama yaparak aynı isimdeki görevlerden sadece en sonuncusunu al (Tekrarı önle)
            var uniqueTemplates = allPinned
                .GroupBy(q => q.Title)
                .Select(g => g.First())
                .Select(q => new QuestDto
                {
                    Id = q.Id, // Referans ID
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    Category = q.Category,
                    ColorCode = q.ColorCode,
                    IsPinned = true
                })
                .ToList();

            return uniqueTemplates;
        }

        public async Task<bool> TogglePinStatusAsync(Guid questId, Guid userId)
        {
            var quest = await _questRepository.GetByIdAsync(questId);
            if (quest == null || quest.UserId != userId) return false;

            // Pin durumunu değiştir (Bu artık "Şablonlara Ekle/Çıkar" işlevi görüyor)
            quest.IsPinned = !quest.IsPinned;

            _questRepository.Update(quest);
            await _questRepository.SaveAsync();

            return quest.IsPinned;
        }

        public async Task<OperationResultDto> ToggleQuestStatusAsync(Guid questId, Guid userId)
        {
            // 1. Transaction Başlat (Veri Bütünlüğü İçin)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var quest = await _questRepository.GetByIdAsync(questId);
                if (quest == null) return new OperationResultDto { IsSuccess = false, Message = "Görev bulunamadı." };
                if (quest.UserId != userId) return new OperationResultDto { IsSuccess = false, Message = "Yetkisiz işlem." };

                // TR Saati Ayarları (Senin kodundan korundu)
                var trTime = DateTime.UtcNow.AddHours(3);
                var todayTr = trTime.Date;
                var todayStartUtc = todayTr.AddHours(-3);
                var todayEndUtc = todayTr.AddDays(1).AddHours(-3).AddTicks(-1);

                var user = await _userRepository.GetByIdAsync(userId);

                // Günlük Performans Kaydını Bul
                var todayPerformance = await _dailyPerformanceRepository
                    .GetWhere(p => p.UserId == userId && p.Date >= todayStartUtc && p.Date <= todayEndUtc)
                    .FirstOrDefaultAsync();

                if (todayPerformance != null && todayPerformance.IsDayClosed)
                    return new OperationResultDto { IsSuccess = false, Message = "Gün kapandı! Değişiklik yapılamaz." };

                bool isLevelUp = false;
                int pointsChange = 0;

                // --- SENARYO 1: GÖREVİ GERİ ALMA (UNCHECK) ---
                if (quest.IsCompleted)
                {
                    quest.IsCompleted = false;
                    quest.CompletedDate = null;
                    pointsChange = -quest.RewardPoints;

                    if (user != null)
                    {
                        user.TotalXp += pointsChange; // Puanı düş
                        // Level düşürmüyoruz (Genelde oyunlarda level düşmez, sadece puan düşer)
                    }

                    if (todayPerformance != null)
                    {
                        todayPerformance.TotalPointsEarned += pointsChange;
                        _dailyPerformanceRepository.Update(todayPerformance);
                    }
                }
                // --- SENARYO 2: GÖREVİ TAMAMLAMA (CHECK) ---
                else
                {
                    quest.IsCompleted = true;
                    quest.CompletedDate = trTime;
                    pointsChange = quest.RewardPoints;

                    if (user != null)
                    {
                        user.TotalXp += pointsChange;

                        // --- YENİ EKLENEN: LEVEL ATLAMA MANTIĞI ---
                        // Formül: Her 1000 Puan = 1 Level (Örnek)
                        // Mevcut Level = (TotalXP / 1000) + 1
                        int calculatedLevel = (user.TotalXp / 1000) + 1;
                        if (calculatedLevel > user.Level)
                        {
                            user.Level = calculatedLevel;
                            isLevelUp = true;
                        }
                        // -------------------------------------------
                    }

                    // Performans Kaydı Oluştur veya Güncelle
                    if (todayPerformance == null)
                    {
                        todayPerformance = new DailyPerformance
                        {
                            UserId = userId,
                            Date = trTime,
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

                // Tüm Değişiklikleri Kaydet
                _questRepository.Update(quest);
                if (user != null) _userRepository.Update(user);

                // Entity Framework Core'da tek bir SaveAsync tüm update'leri commit eder
                await _questRepository.SaveAsync();

                // Rozetleri Kontrol Et (Sadece tamamlama durumunda)
                List<string> newBadges = new List<string>();
                if (quest.IsCompleted)
                {
                    try
                    {
                        newBadges = await _badgeService.CheckAndAwardBadgesAsync(quest.UserId);
                    }
                    catch { /* Loglama eklenebilir */ }
                }

                // Transaction'ı Onayla
                await transaction.CommitAsync();

                // Kullanıcıya Dönülecek Mesaj
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
            if (quest == null || quest.UserId != request.UserId) return false;
            if (request.RewardPoints > MAX_QUEST_POINTS) return false;

            var trTime = DateTime.UtcNow.AddHours(3);
            var todayTr = trTime.Date;
            var todayStartUtc = todayTr.AddHours(-3);
            var todayEndUtc = todayTr.AddDays(1).AddHours(-3).AddTicks(-1);

            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
                d.UserId == request.UserId &&
                d.Date >= todayStartUtc && d.Date <= todayEndUtc &&
                d.IsDayClosed).AnyAsync();

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
            var todayTr = trTime.Date;
            var todayStartUtc = todayTr.AddHours(-3);
            var todayEndUtc = todayTr.AddDays(1).AddHours(-3).AddTicks(-1);

            var isDayClosed = await _dailyPerformanceRepository.GetWhere(d =>
               d.UserId == userId &&
               d.Date >= todayStartUtc && d.Date <= todayEndUtc &&
               d.IsDayClosed).AnyAsync();

            if (isDayClosed) throw new Exception("Gün kapandı, silme işlemi yapılamaz.");

            await _questRepository.RemoveAsync(questId);
            await _questRepository.SaveAsync();
            return true;
        }
    }
}