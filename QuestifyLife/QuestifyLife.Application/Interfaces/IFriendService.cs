using QuestifyLife.Application.DTOs.Friends;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Interfaces
{
    public interface IFriendService
    {
        Task<string> SendRequestAsync(SendFriendRequestDto request);
        Task<string> RespondToRequestAsync(Guid requestId, bool isAccepted); // Cevap ver
        Task<List<FriendRequestListDto>> GetPendingRequestsAsync(Guid userId); // Bekleyenleri gör
        Task<List<FriendDto>> GetFriendsLeaderboardAsync(Guid userId); // Arkadaşları listele
        Task<bool> RemoveFriendAsync(Guid userId, Guid friendId); // Arkadaşlıktan çıkar
    }
}
