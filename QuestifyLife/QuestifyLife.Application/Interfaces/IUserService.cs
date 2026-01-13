using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto> GetProfileAsync(Guid userId);
        Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto request);
        Task<ServiceResponse<PublicUserProfileDto>> GetPublicUserProfileAsync(Guid targetUserId);
    }
}
