using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Performance;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.Wrappers;
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

            DateTime targetDate = date.HasValue ? date.Value.Date : DateTime.UtcNow.Date;

            // 1. O günün görevlerini çek
            var targetQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == targetDate)
                .ToListAsync();

            // 2. Kazanılan puanı hesapla (görevlerden)
            var pointsEarnedOnTargetDate = targetQuests
                .Where(q => q.IsCompleted)
                .Sum(q => q.RewardPoints);

            // 3. Performans kaydını çek
            var targetPerformance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == targetDate)
                .FirstOrDefaultAsync();

            // 4. Pinlenmiş (Sabit) görev şablonlarını çek
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

                // Bugün kazanılan puan
                PointsEarnedToday = pointsEarnedOnTargetDate,

                // DÜZELTME: Entity'deki isim "IsDayClosed"
                IsDayClosed = targetPerformance != null ? targetPerformance.IsDayClosed : false,

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

            // 1. Bugünün performans kaydını bul
            var performance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == today)
                .FirstOrDefaultAsync();

            // 2. KONTROL: Kayıt var VE IsDayClosed=true ise hata ver.
            // DÜZELTME: Entity'deki isim "IsDayClosed"
            if (performance != null && performance.IsDayClosed)
            {
                return new OperationResultDto { IsSuccess = false, Message = "Bugün zaten kapatılmış! Yarın görüşürüz. 👋" };
            }

            var todaysQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == today)
                .ToListAsync();

            int earnedPoints = todaysQuests.Where(q => q.IsCompleted).Sum(q => q.RewardPoints);
            // Ceza puanlarını hesapla (tamamlanmamış görevlerden)
            int penaltyPoints = todaysQuests.Where(q => !q.IsCompleted).Sum(q => q.PenaltyPoints);

            // Ceza puanlarını kullanıcıdan düşüyoruz (0'ın altına inmesin)
            if (penaltyPoints > 0)
            {
                user.TotalXp = Math.Max(0, user.TotalXp - penaltyPoints);
            }

            bool isTargetReached = earnedPoints >= user.DailyTargetPoints;

            // Streak (Seri) Güncelleme
            if (isTargetReached)
            {
                // Eğer gün daha önce kapatılmadıysa seriyi artır
                user.CurrentStreak++;
            }
            else
            {
                // Hedefe ulaşılamadıysa seri sıfırlanır
                user.CurrentStreak = 0;
            }

            // 3. Kayıt İşlemi (Ekleme veya Güncelleme)
            if (performance == null)
            {
                // Hiç kayıt yoksa yeni oluştur
                performance = new DailyPerformance
                {
                    UserId = userId,
                    Date = today,
                    TotalPointsEarned = earnedPoints,
                    IsTargetReached = isTargetReached,
                    IsDayClosed = true, // Günü kapatıyoruz
                    RolloverDebt = isTargetReached ? 0 : (user.DailyTargetPoints - earnedPoints),
                    DayNote = dayNote
                };
                await _dailyPerformanceRepository.AddAsync(performance);
            }
            else
            {
                // Kayıt varsa (gün içinde işlem yapılmışsa) güncelle ve kapat
                performance.TotalPointsEarned = earnedPoints;
                performance.IsTargetReached = isTargetReached;
                performance.IsDayClosed = true; // Günü kapatıyoruz
                performance.RolloverDebt = isTargetReached ? 0 : (user.DailyTargetPoints - earnedPoints);
                performance.DayNote = dayNote;

                _dailyPerformanceRepository.Update(performance);
            }

            // Kullanıcıyı güncelle (Streak ve XP değiştiği için)
            _userRepository.Update(user);

            await _userRepository.SaveAsync();
            await _dailyPerformanceRepository.SaveAsync();

            // Rozet kontrolü yap
            var newBadges = await _badgeService.CheckAndAwardBadgesAsync(userId);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = $"Gün başarıyla kapatıldı! {(isTargetReached ? "Hedefe ulaştın! 🔥" : "Hedef tamamlanamadı.")}",
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