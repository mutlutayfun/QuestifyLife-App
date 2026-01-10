using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Performance;
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

            // Bugünün tarih aralığını belirle (Saat farklarını yutmamak için)
            var today = DateTime.UtcNow.Date;

            // Bugünün görevlerini çek
            var todaysQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == today)
                .ToListAsync();

            // Bugün kazanılan puanı hesapla (Sadece tamamlananlar)
            var pointsEarnedToday = todaysQuests
                .Where(q => q.IsCompleted)
                .Sum(q => q.RewardPoints);

            // DTO'yu doldur ve gönder
            return new DashboardDto
            {
                Username = user.Username,
                TotalXp = user.TotalXp,
                DailyTarget = user.DailyTargetPoints,
                CurrentStreak = user.CurrentStreak,
                PointsEarnedToday = pointsEarnedToday,
                TodayQuests = todaysQuests.Select(q => new QuestDto
                {
                    Id = q.Id,
                    Title = q.Title,
                    Description = q.Description,
                    RewardPoints = q.RewardPoints,
                    IsCompleted = q.IsCompleted
                }).ToList()
            };
        }

        public async Task<OperationResultDto> FinishDayAsync(Guid userId, string? dayNote)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            var today = DateTime.UtcNow.Date;

            // Bugünün performans kaydı zaten var mı? (Günde 1 kere çalışmalı)
            var existingPerformance = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date == today)
                .FirstOrDefaultAsync();

            if (existingPerformance != null)
                return new OperationResultDto { IsSuccess = false, Message = "Bugün zaten kapatılmış!" };

            // Görevleri çek
            var todaysQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.ScheduledDate.Date == today)
                .ToListAsync();

            // İstatistikleri Hesapla
            int earnedPoints = todaysQuests.Where(q => q.IsCompleted).Sum(q => q.RewardPoints);

            // Yapılmayan görevlerin ceza puanlarını topla
            int penaltyPoints = todaysQuests.Where(q => !q.IsCompleted).Sum(q => q.PenaltyPoints); // Zaten negatif gelir (-5 gibi)

            // Toplam günlük net skor (Ödül - Ceza)
            int netScore = earnedPoints + penaltyPoints;

            // Kullanıcının ana puanına yansıt (Ceza ise puan düşer)
            user.TotalXp += penaltyPoints; // Sadece cezayı düşüyoruz, ödülleri zaten görev tamamlanınca anlık vermiştik.

            // Hedef Kontrolü
            bool isTargetReached = earnedPoints >= user.DailyTargetPoints;
            if (isTargetReached)
            {
                user.CurrentStreak++; // Seri arttır
            }
            else
            {
                user.CurrentStreak = 0; // Seri bozuldu :(
            }

            // Günlük Raporu Kaydet
            var dailyPerf = new DailyPerformance
            {
                UserId = userId,
                Date = today,
                TotalPointsEarned = earnedPoints,
                IsTargetReached = isTargetReached,
                IsDayClosed = true,
                RolloverDebt = isTargetReached ? 0 : (user.DailyTargetPoints - earnedPoints), // Hedefe ulaşmadıysa kalan fark borç olur
                DayNote = dayNote
            };

            await _dailyPerformanceRepository.AddAsync(dailyPerf);
            _userRepository.Update(user); // Streak ve XP güncellemeleri için
            await _userRepository.SaveAsync();
            await _dailyPerformanceRepository.SaveAsync();

            // Rozet Kontrolü
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
            // O aya ait performans kayıtlarını çek
            var performances = await _dailyPerformanceRepository
                .GetWhere(d => d.UserId == userId && d.Date.Year == year && d.Date.Month == month)
                .ToListAsync();

            // O aya ait tamamlanan görev sayılarını bulmak için biraz karmaşık sorgu gerekir.
            // Şimdilik sadece performans tablosundan gidelim, basit olsun.

            var calendarData = performances.Select(p => new CalendarDayDto
            {
                Date = p.Date,
                Points = p.TotalPointsEarned,
                TargetReached = p.IsTargetReached,
                Note = p.DayNote,
                CompletedQuestCount = 0 // Bunu doldurmak için Join gerekir, şimdilik 0 kalsın veya ayrı sorgu atılabilir.
            }).ToList();

            return calendarData;
        }
    }
}
