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

        public async Task<DashboardDto> GetDashboardAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            // Senin kullandığın tarih mantığı (UTC Date)
            var today = DateTime.UtcNow.Date;

            // 1. Bugünün görevlerini çek
            var todaysQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == today)
                .ToListAsync();

            // 2. Bugün kazanılan puanı hesapla
            var pointsEarnedToday = todaysQuests
                .Where(q => q.IsCompleted)
                .Sum(q => q.RewardPoints);

            var todayPerformance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == today)
                .FirstOrDefaultAsync();

            // --- YENİ EKLENEN KISIM: SIK KULLANILANLAR (PİNLENENLER) ---
            // Kullanıcının "IsPinned = true" olan tüm görevlerini çekiyoruz
            var allPinned = await _questRepository
                .GetWhere(q => q.UserId == userId && q.IsPinned)
                .OrderByDescending(q => q.CreatedDate) // En yeniler üstte
                .ToListAsync();

            // Aynı isimdeki görevleri gruplayıp tekilleştiriyoruz (Şablon mantığı)
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
                    IsCompleted = false // Şablon olduğu için tamamlanmamış görünür
                })
                .ToList();
            // -------------------------------------------------------------

            // DTO'yu doldur ve gönder
            return new DashboardDto
            {
                Username = user.Username,
                TotalXp = user.TotalXp,
                DailyTarget = user.DailyTargetPoints,
                CurrentStreak = user.CurrentStreak,
                PointsEarnedToday = pointsEarnedToday,
                IsDayClosed = todayPerformance != null ? todayPerformance.IsDayClosed : false,

                // Bugünün görevleri listesi
                TodayQuests = todaysQuests.Select(q => new QuestDto
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

                // Pinlenenler listesi (Buraya ekledik)
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