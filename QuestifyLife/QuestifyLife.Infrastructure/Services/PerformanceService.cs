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

            // 2. Kazanılan puanı hesapla
            var pointsEarnedOnTargetDate = targetQuests
                .Where(q => q.IsCompleted)
                .Sum(q => q.RewardPoints);

            // 3. Performans kaydını çek
            var targetPerformance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == targetDate)
                .FirstOrDefaultAsync();

            // 4. Pinlenmiş görev şablonları
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
                    IsCompleted = false,
                    ReminderDate = q.ReminderDate
                })
                .ToList();

            // --- YENİ: Seri Durumu ve Motivasyon Mesajı Hesaplama ---
            // Bugünden geriye dönük kaç gün kaçırılmış kontrol et
            int consecutiveMisses = await CalculateConsecutiveMisses(userId, targetDate);

            string streakStatusMsg = "Serin Güvende! 🔥";
            string motivationalMsg = "Harika gidiyorsun, aynen devam!";

            if (consecutiveMisses == 1)
            {
                streakStatusMsg = "Uyarı: Dün Hedefi Kaçırdın! ⚠️";
                motivationalMsg = "Sorun yok, bugün telafi edip serini koruyabilirsin. Sana güveniyorum!";
            }
            else if (consecutiveMisses == 2)
            {
                streakStatusMsg = "KRİTİK DURUM! 🚨";
                motivationalMsg = "Bugün son şansın! Eğer bugün de hedefi tutturamazsan serin sıfırlanacak. Yapabilirsin!";
            }
            // --------------------------------------------------------

            return new DashboardDto
            {
                Username = user.Username,
                TotalXp = user.TotalXp,
                DailyTarget = user.DailyTargetPoints,
                CurrentStreak = user.CurrentStreak,
                PointsEarnedToday = pointsEarnedOnTargetDate,
                IsDayClosed = targetPerformance != null ? targetPerformance.IsDayClosed : false,

                // Yeni alanları dolduruyoruz
                StreakStatusMessage = streakStatusMsg,
                MotivationalMessage = motivationalMsg,
                ConsecutiveMissedDays = consecutiveMisses,

                TodayQuests = targetQuests.Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted,
                    IsPinned = q.IsPinned,
                    Category = q.Category,
                    ColorCode = q.ColorCode,
                    ReminderDate = q.ReminderDate
                }).ToList(),

                PinnedTemplates = pinnedTemplates
            };
        }

        public async Task<OperationResultDto> FinishDayAsync(Guid userId, string? dayNote)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            var today = DateTime.UtcNow.Date;

            var performance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == today)
                .FirstOrDefaultAsync();

            if (performance != null && performance.IsDayClosed)
            {
                return new OperationResultDto { IsSuccess = false, Message = "Bugün zaten kapatılmış! Yarın görüşürüz. 👋" };
            }

            var todaysQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == today)
                .ToListAsync();

            int earnedPoints = todaysQuests.Where(q => q.IsCompleted).Sum(q => q.RewardPoints);
            int penaltyPoints = todaysQuests.Where(q => !q.IsCompleted).Sum(q => q.PenaltyPoints);

            if (penaltyPoints > 0)
            {
                user.TotalXp = Math.Max(0, user.TotalXp - penaltyPoints);
            }

            bool isTargetReached = earnedPoints >= user.DailyTargetPoints;
            string resultMessage = "";

            // --- YENİ MANTIK: 3 Gün Kuralı ---
            // Önce geçmiş kaçırmaları hesapla (bugün hariç)
            int pastMisses = await CalculateConsecutiveMisses(userId, today);

            if (isTargetReached)
            {
                // Bugün başarılı! Seri artar, risk sıfırlanır.
                user.CurrentStreak++;
                resultMessage = "Harikasın! Hedefi tutturdun, seri tam gaz devam ediyor! 🔥";
            }
            else
            {
                // Bugün başarısız.
                // Eğer geçmişten 2 tane varsa + bugün (1) = 3 olur ve seri yanar.
                int totalConsecutiveFails = pastMisses + 1;

                if (totalConsecutiveFails >= 3)
                {
                    user.CurrentStreak = 0;
                    resultMessage = "Üzgünüm... 3 gün üst üste hedefi tutturamadığın için serin sıfırlandı. Yeni bir sayfa açalım! 💪";
                }
                else
                {
                    // Seri bozulmadı ama tehlike arttı
                    // totalConsecutiveFails 1 ise (Sadece bugün kaçtı)
                    // totalConsecutiveFails 2 ise (Dün ve Bugün kaçtı)
                    resultMessage = $"Hedef tutturulamadı. Dikkat et, üst üste 3 gün yapamazsan serin bozulur. ({totalConsecutiveFails}/3 Hata) ⚠️";
                }
            }
            // ---------------------------------

            if (performance == null)
            {
                performance = new DailyPerformance
                {
                    UserId = userId,
                    Date = today,
                    TotalPointsEarned = earnedPoints,
                    IsTargetReached = isTargetReached,
                    IsDayClosed = true,
                    RolloverDebt = isTargetReached ? 0 : (user.DailyTargetPoints - earnedPoints),
                    DayNote = dayNote
                };
                await _dailyPerformanceRepository.AddAsync(performance);
            }
            else
            {
                performance.TotalPointsEarned = earnedPoints;
                performance.IsTargetReached = isTargetReached;
                performance.IsDayClosed = true;
                performance.RolloverDebt = isTargetReached ? 0 : (user.DailyTargetPoints - earnedPoints);
                performance.DayNote = dayNote;

                _dailyPerformanceRepository.Update(performance);
            }

            _userRepository.Update(user);

            await _userRepository.SaveAsync();
            await _dailyPerformanceRepository.SaveAsync();

            var newBadges = await _badgeService.CheckAndAwardBadgesAsync(userId);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = resultMessage,
                NewBadges = newBadges
            };
        }

        // ... GetCalendarDataAsync ve GetLeaderboardAsync aynı kalıyor ...
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

        // --- YARDIMCI METOT: Geriye Dönük Kaçırma Kontrolü ---
        private async Task<int> CalculateConsecutiveMisses(Guid userId, DateTime referenceDate)
        {
            // Referans tarihten (genellikle Bugün) önceki günleri kontrol et
            var yesterday = referenceDate.AddDays(-1);
            var dayBeforeYesterday = referenceDate.AddDays(-2);

            // Dün ve evvelsi günün kayıtlarını çek
            var records = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && (d.Date == yesterday || d.Date == dayBeforeYesterday))
                .ToListAsync();

            var pYesterday = records.FirstOrDefault(d => d.Date == yesterday);
            var pDayBefore = records.FirstOrDefault(d => d.Date == dayBeforeYesterday);

            // Kayıt yoksa VEYA hedef tutmamışsa "Kaçırılmış" sayılır
            bool missedYesterday = pYesterday == null || !pYesterday.IsTargetReached;
            bool missedDayBefore = pDayBefore == null || !pDayBefore.IsTargetReached;

            if (missedYesterday && missedDayBefore) return 2; // Son 2 gün kaçmış (Bugün de kaçarsa 3 olacak)
            if (missedYesterday) return 1; // Sadece dün kaçmış

            return 0; // Dün başarılıymış, zincir sağlam
        }
    }
}