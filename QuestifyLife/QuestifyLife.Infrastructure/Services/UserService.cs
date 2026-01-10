using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.Interfaces;
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

        public UserService(IGenericRepository<User> userRepository, IBadgeService badgeService)
        {
            _userRepository = userRepository;
            _badgeService = badgeService;
        }

        public async Task<UserProfileDto> GetProfileAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            var allBadges = await _badgeService.GetUserBadgesAsync(userId);
            var earnedBadges = allBadges.Where(b => b.IsEarned).ToList();

            return new UserProfileDto
            {
                Username = user.Username,
                Email = user.Email,
                TotalXp = user.TotalXp,
                CurrentStreak = user.CurrentStreak,
                DailyTargetPoints = user.DailyTargetPoints,
                PersonalManifesto = user.PersonalManifesto,
                AvatarId = user.AvatarId,
                Badges = allBadges
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            
            if (request.DailyTargetPoints > 0)
                user.DailyTargetPoints = request.DailyTargetPoints;

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
