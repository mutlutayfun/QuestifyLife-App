using Microsoft.EntityFrameworkCore; // ToListAsync için gerekli
using QuestifyLife.Application.DTOs.Auth; // DTO'lar için
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.Wrappers;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IBadgeService _badgeService;
        private readonly IGenericRepository<Quest> _questRepository; // EKLENDİ: Puan hesaplaması için gerekli

        // Constructor güncellendi
        public UserService(IGenericRepository<User> userRepository, IBadgeService badgeService, IGenericRepository<Quest> questRepository)
        {
            _userRepository = userRepository;
            _badgeService = badgeService;
            _questRepository = questRepository;
        }

        public async Task<UserProfileDto> GetProfileAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            // --- PUAN HESAPLAMALARI ---
            var now = DateTime.UtcNow;

            // Hafta Başı (Pazartesi)
            var diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
            var weekStart = now.AddDays(-1 * diff).Date;

            // Ay Başı
            var monthStart = new DateTime(now.Year, now.Month, 1);

            // Tamamlanan Görevleri Çek
            var completedQuests = await _questRepository
                .GetWhere(q => q.UserId == userId && q.IsCompleted && q.CompletedDate >= monthStart)
                .ToListAsync();

            var weeklyPoints = completedQuests.Where(q => q.CompletedDate >= weekStart).Sum(q => q.RewardPoints);
            var monthlyPoints = completedQuests.Sum(q => q.RewardPoints);
            // --------------------------

            var allBadges = await _badgeService.GetUserBadgesAsync(userId);

            return new UserProfileDto
            {
                Username = user.Username,
                Email = user.Email,
                TotalXp = user.TotalXp,
                CurrentStreak = user.CurrentStreak,
                DailyTargetPoints = user.DailyTargetPoints,
                PersonalManifesto = user.PersonalManifesto,
                AvatarId = user.AvatarId,

                // YENİ ALANLAR (HESAPLANAN VERİLER)
                WeeklyTargetPoints = user.WeeklyTargetPoints,
                MonthlyTargetPoints = user.MonthlyTargetPoints,
                YearlyTargetPoints = user.YearlyTargetPoints,

                PointsEarnedThisWeek = weeklyPoints,
                PointsEarnedThisMonth = monthlyPoints,

                Badges = allBadges
            };
        }
        public async Task<ServiceResponse<PublicUserProfileDto>> GetPublicUserProfileAsync(Guid targetUserId)
        {
            var user = await _userRepository.GetByIdAsync(targetUserId);
            if (user == null) return new ServiceResponse<PublicUserProfileDto> { Success = false, Message = "Kullanıcı bulunamadı." };

            // Kullanıcının sadece KAZANDIĞI rozetleri çekelim
            var allBadges = await _badgeService.GetUserBadgesAsync(targetUserId);
            var earnedBadges = allBadges.Where(b => b.IsEarned).ToList();

            var publicProfile = new PublicUserProfileDto
            {
                Username = user.Username,
                AvatarId = user.AvatarId,
                TotalXp = user.TotalXp,
                CurrentStreak = user.CurrentStreak,
                PersonalManifesto = user.PersonalManifesto,
                JoinDate = user.CreatedDate,
                EarnedBadges = earnedBadges
            };

            return new ServiceResponse<PublicUserProfileDto>(publicProfile);
        }


        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (request.DailyTargetPoints > 0)
            {
                user.DailyTargetPoints = request.DailyTargetPoints > 200 ? 200 : request.DailyTargetPoints;
            }

            // YENİ HEDEFLERİ GÜNCELLE
            if (request.WeeklyTargetPoints > 0)
                user.WeeklyTargetPoints = request.WeeklyTargetPoints;

            if (request.MonthlyTargetPoints > 0)
                user.MonthlyTargetPoints = request.MonthlyTargetPoints;

            if (request.YearlyTargetPoints > 0)
                user.YearlyTargetPoints = request.YearlyTargetPoints;

            if (request.PersonalManifesto != null)
                user.PersonalManifesto = request.PersonalManifesto;

            if (!string.IsNullOrEmpty(request.AvatarId))
            {
                user.AvatarId = request.AvatarId;
            }

            _userRepository.Update(user);
            await _userRepository.SaveAsync();
            return true;
        }
    }
}