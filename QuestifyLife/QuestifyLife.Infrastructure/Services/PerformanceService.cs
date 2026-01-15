using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Performance;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.Wrappers; // Senin yapındaki Wrapper
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
    public class PerformanceService : IPerformanceService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<Quest> _questRepository;
        private readonly IGenericRepository<DailyPerformance> _dailyPerformanceRepository;
        private readonly IBadgeService _badgeService;

        public PerformanceService(
            IGenericRepository<User> userRepository,
            IGenericRepository<Quest> questRepository,
            IGenericRepository<DailyPerformance> dailyPerformanceRepository,
            IBadgeService badgeService)
        {
            _userRepository = userRepository;
            _questRepository = questRepository;
            _dailyPerformanceRepository = dailyPerformanceRepository;
            _badgeService = badgeService;
        }

        public async Task<DashboardDto> GetDashboardAsync(Guid userId, DateTime? date = null)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            // 1. Hedef Tarihi Belirle
            // Frontend'den tarih geldiyse onu al, yoksa bugünü al.
            // Önemli: Gelen tarih UTC ise ve Frontend TR saati gönderiyorsa, 
            // burada sadece .Date kısmını almak yeterli olmayabilir.
            // Ancak Frontend'de .toISOString() kullandık, bu UTC gönderir.
            // Biz basitçe gelen tarihin "Günün Başlangıcı" olduğunu varsayalım.

            DateTime targetDate;
            if (date.HasValue)
            {
                targetDate = date.Value.Date;
            }
            else
            {
                targetDate = DateTime.UtcNow.Date; // Varsayılan Bugün
            }

            // Veritabanında arama yapmak için UTC aralığı oluştur
            // Not: Senin sisteminde tarihler nasıl kaydediliyor? 
            // QuestService'te TR saati (+3) eklenip kaydedildiğini görmüştüm.
            // Eğer veritabanına TR saati ile kaydettiysen, burada da TR saati ile sorgulamalısın.
            // Senin mevcut kodunda: q.ScheduledDate.Date == today kullanılmış.

            // Mevcut koduna sadık kalarak:
            // "today" değişkeni yerine "targetDate" kullanacağız.

            // 2. Seçili Günün Görevlerini Çek
            // NOT: EF Core'da .Date kullanımı bazen saat farkından dolayı sorun yaratabilir.
            // Garanti olsun diye aralık (Range) sorgusu yapalım.
            var dayStart = targetDate;
            var dayEnd = targetDate.AddDays(1).AddTicks(-1);

            // Eğer senin sisteminde UTC+3 kaydı varsa ve sunucu UTC ise:
            // Bu kısım biraz karışık olabilir, senin mevcut yapını bozmadan 
            // "q.ScheduledDate.Date == targetDate" mantığını koruyalım.
            // Ancak QuestService'de "ScheduledDate = trTime" yaptığını biliyorum.
            // Bu yüzden gelen "date" parametresini de TR saatine uygun hale getirmek gerekebilir.
            // Şimdilik en güvenli yol, mevcut yapını kopyalamak:

            var targetQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == targetDate)
                .ToListAsync();

            // 3. Puan Hesapla
            var pointsEarnedOnTargetDate = targetQuests
                .Where(q => q.IsCompleted)
                .Sum(q => q.RewardPoints);

            // 4. Performans Kaydını Çek
            var targetPerformance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == targetDate)
                .FirstOrDefaultAsync();

            // 5. Pinlenen Şablonları Çek (Bunlar tarihten bağımsızdır, her zaman gelir)
            var allPinned = await _questRepository
                .GetWhere(q => q.UserId == userId && q.IsPinned)
                .OrderByDescending(q => q.CreatedDate)
                .ToListAsync();

            var pinnedTemplates = allPinned
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
                    IsCompleted = false
                })
                .ToList();

            return new DashboardDto
            {
                Username = user.Username,
                TotalXp = user.TotalXp,
                DailyTarget = user.DailyTargetPoints,
                CurrentStreak = user.CurrentStreak,

                // Seçili güne ait puan
                PointsEarnedToday = pointsEarnedOnTargetDate,

                // Seçili gün kapalı mı?
                IsDayClosed = targetPerformance != null ? targetPerformance.IsDayClosed : false,

                // Seçili günün görevleri
                TodayQuests = targetQuests.Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted,
                    IsPinned = q.IsPinned,
                    Category = q.Category,
                    ColorCode = q.ColorCode
                }).ToList(),

                PinnedTemplates = pinnedTemplates
            };
        }

        public async Task<OperationResultDto> FinishDayAsync(Guid userId, string? dayNote)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            var today = DateTime.UtcNow.Date;

            var existingPerformance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == today)
                .FirstOrDefaultAsync();

            if (existingPerformance != null)
                return new OperationResultDto { IsSuccess = false, Message = "Bugün zaten kapatılmış!" };

            var todaysQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == today)
                .ToListAsync();

            int earnedPoints = todaysQuests.Where(q => q.IsCompleted).Sum(q => q.RewardPoints);

            // PenaltyPoints modelinde yoksa hata verebilir, eğer yoksa burayı 0 yapabilirsin.
            // Senin kodunda olduğu için bıraktım.
            int penaltyPoints = todaysQuests.Where(q => !q.IsCompleted).Sum(q => q.PenaltyPoints);

            int netScore = earnedPoints + penaltyPoints;

            user.TotalXp += penaltyPoints;

            bool isTargetReached = earnedPoints >= user.DailyTargetPoints;
            if (isTargetReached)
            {
                user.CurrentStreak++;
            }
            else
            {
                user.CurrentStreak = 0;
            }

            var dailyPerf = new DailyPerformance
            {
                UserId = userId,
                Date = today,
                TotalPointsEarned = earnedPoints,
                IsTargetReached = isTargetReached,
                IsDayClosed = true,
                RolloverDebt = isTargetReached ? 0 : (user.DailyTargetPoints - earnedPoints),
                DayNote = dayNote
            };

            await _dailyPerformanceRepository.AddAsync(dailyPerf);
            _userRepository.Update(user);
            await _userRepository.SaveAsync();
            await _dailyPerformanceRepository.SaveAsync();

            var newBadges = await _badgeService.CheckAndAwardBadgesAsync(userId);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = $"Gün kapatıldı! Net Skor: {netScore}. Hedef: {(isTargetReached ? "Başarılı" : "Başarısız")}.",
                NewBadges = newBadges
            };
        }

        public async Task<List<CalendarDayDto>> GetCalendarDataAsync(Guid userId, int year, int month)
        {
            var performances = await _dailyPerformanceRepository
               .GetWhere(d => d.UserId == userId && d.Date.Year == year && d.Date.Month == month)
               .ToListAsync();

            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59);

            var quests = await _questRepository
                .GetWhere(q => q.UserId == userId &&
                               q.IsCompleted &&
                               q.ScheduledDate >= startDate &&
                               q.ScheduledDate <= endDate)
                .ToListAsync();

            var calendarData = performances.Select(p => new CalendarDayDto
            {
                Date = p.Date,
                Points = p.TotalPointsEarned,
                TargetReached = p.IsTargetReached,
                Note = p.DayNote,
                CompletedQuests = quests
                    .Where(q => q.ScheduledDate.Date == p.Date.Date)
                    .Select(q => new CalendarQuestDto
                    {
                        Title = q.Title,
                        Category = q.Category ?? "Genel",
                        RewardPoints = q.RewardPoints
                    })
                    .ToList(),
                CompletedQuestCount = quests.Count(q => q.ScheduledDate.Date == p.Date.Date)
            }).ToList();

            return calendarData;
        }

        public async Task<ServiceResponse<List<LeaderboardUserDto>>> GetLeaderboardAsync(Guid currentUserId)
        {
            var allUsers = await _userRepository.GetWhere(u => true)
                .OrderByDescending(u => u.TotalXp)
                .Take(50)
                .ToListAsync();

            var leaderboard = new List<LeaderboardUserDto>();
            int rankCounter = 1;

            foreach (var user in allUsers)
            {
                leaderboard.Add(new LeaderboardUserDto
                {
                    UserId = user.Id,
                    Rank = rankCounter++,
                    Username = user.Username,
                    AvatarId = string.IsNullOrEmpty(user.AvatarId) ? "avatar_1" : user.AvatarId,
                    TotalXp = user.TotalXp,
                    IsCurrentUser = user.Id == currentUserId
                });
            }

            return new ServiceResponse<List<LeaderboardUserDto>>(leaderboard);
        }
    }
}