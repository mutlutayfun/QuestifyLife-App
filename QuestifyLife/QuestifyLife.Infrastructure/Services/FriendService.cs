using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Friends;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
    public class FriendService : IFriendService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly IGenericRepository<Friendship> _friendshipRepository;

        public FriendService(IGenericRepository<User> userRepository, IGenericRepository<Friendship> friendshipRepository)
        {
            _userRepository = userRepository;
            _friendshipRepository = friendshipRepository;
        }

        public async Task<string> SendRequestAsync(SendFriendRequestDto request)
        {
            var sender = await _userRepository.GetByIdAsync(request.SenderId);
            if (sender == null) throw new Exception("Gönderen kullanıcı bulunamadı.");

            User? targetUser = null;

            // 1. Gelen veri bir GUID (User ID) mi?
            if (Guid.TryParse(request.UsernameOrEmail, out Guid targetGuid))
            {
                targetUser = await _userRepository.GetByIdAsync(targetGuid);
            }
            else
            {
                // 2. Değilse: Kullanıcı Adı veya Email olarak ara
                targetUser = await _userRepository.GetWhere(u =>
                    u.Email == request.UsernameOrEmail ||
                    u.Username == request.UsernameOrEmail
                ).FirstOrDefaultAsync();
            }

            // KONTROLLER
            if (targetUser == null) throw new Exception("Kullanıcı bulunamadı.");
            if (sender.Id == targetUser.Id) throw new Exception("Kendine arkadaşlık isteği atamazsın.");

            // 3. Zaten ilişki var mı?
            var existing = await _friendshipRepository.GetWhere(f =>
                (f.RequesterId == request.SenderId && f.AddresseeId == targetUser.Id) ||
                (f.RequesterId == targetUser.Id && f.AddresseeId == request.SenderId))
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                if (existing.Status == FriendshipStatus.Pending)
                {
                    if (existing.RequesterId == request.SenderId) return "Zaten bekleyen bir istek var.";
                    else return "Bu kullanıcı sana zaten istek göndermiş. İstekler sekmesine bak!";
                }
                if (existing.Status == FriendshipStatus.Accepted) return "Zaten arkadaşsınız.";
            }

            // 4. İsteği oluştur
            var newFriendship = new Friendship
            {
                RequesterId = request.SenderId,
                AddresseeId = targetUser.Id,
                Status = FriendshipStatus.Pending,
                CreatedDate = DateTime.UtcNow
            };

            await _friendshipRepository.AddAsync(newFriendship);
            await _friendshipRepository.SaveAsync();

            return "Arkadaşlık isteği gönderildi!";
        }

        // --- DİĞER METOTLAR AYNI KALDI ---

        public async Task<string> SendFriendRequestByIdAsync(Guid requesterId, Guid targetUserId)
        {
            if (requesterId == targetUserId) throw new Exception("Kendine istek gönderemezsin.");

            var targetUser = await _userRepository.GetByIdAsync(targetUserId);
            if (targetUser == null) throw new Exception("Kullanıcı bulunamadı.");

            var existing = await _friendshipRepository.GetWhere(f =>
                (f.RequesterId == requesterId && f.AddresseeId == targetUserId) ||
                (f.RequesterId == targetUserId && f.AddresseeId == requesterId)
            ).FirstOrDefaultAsync();

            if (existing != null)
            {
                if (existing.Status == FriendshipStatus.Pending) return "Zaten bekleyen bir istek var.";
                if (existing.Status == FriendshipStatus.Accepted) return "Zaten arkadaşsınız.";
            }

            var newFriendship = new Friendship
            {
                RequesterId = requesterId,
                AddresseeId = targetUserId,
                Status = FriendshipStatus.Pending,
                CreatedDate = DateTime.UtcNow
            };

            await _friendshipRepository.AddAsync(newFriendship);
            await _friendshipRepository.SaveAsync();

            return "Arkadaşlık isteği gönderildi!";
        }

        public async Task<string> RespondToRequestAsync(Guid requestId, bool isAccepted)
        {
            var friendship = await _friendshipRepository.GetByIdAsync(requestId);
            if (friendship == null) throw new Exception("İstek bulunamadı.");

            if (isAccepted)
            {
                friendship.Status = FriendshipStatus.Accepted;
                _friendshipRepository.Update(friendship);
                await _friendshipRepository.SaveAsync();
                return "Arkadaşlık kabul edildi!";
            }
            else
            {
                await _friendshipRepository.RemoveAsync(requestId);
                await _friendshipRepository.SaveAsync();
                return "İstek reddedildi.";
            }
        }

        public async Task<List<FriendRequestListDto>> GetPendingRequestsAsync(Guid userId)
        {
            var requests = await _friendshipRepository
                .GetWhere(f => f.AddresseeId == userId && f.Status == FriendshipStatus.Pending)
                .Include(f => f.Requester)
                .Select(f => new FriendRequestListDto
                {
                    RequestId = f.Id,
                    SenderUsername = f.Requester.Username,
                    SentDate = f.CreatedDate
                })
                .ToListAsync();

            return requests;
        }

        public async Task<List<FriendDto>> GetFriendsLeaderboardAsync(Guid userId)
        {
            var friendships = await _friendshipRepository
                .GetWhere(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendshipStatus.Accepted)
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .ToListAsync();

            var friendList = new List<FriendDto>();

            foreach (var f in friendships)
            {
                User friendUser = (f.RequesterId == userId) ? f.Addressee : f.Requester;
                friendList.Add(new FriendDto
                {
                    FriendId = friendUser.Id,
                    Username = friendUser.Username,
                    TotalXp = friendUser.TotalXp
                });
            }

            var me = await _userRepository.GetByIdAsync(userId);
            if (me != null)
            {
                friendList.Add(new FriendDto { FriendId = me.Id, Username = me.Username + " (Sen)", TotalXp = me.TotalXp });
            }

            return friendList.OrderByDescending(x => x.TotalXp).ToList();
        }

        public async Task<bool> RemoveFriendAsync(Guid userId, Guid friendId)
        {
            var friendship = await _friendshipRepository.GetWhere(f =>
                (f.RequesterId == userId && f.AddresseeId == friendId) ||
                (f.RequesterId == friendId && f.AddresseeId == userId)
            ).FirstOrDefaultAsync();

            if (friendship == null) return false;

            _friendshipRepository.Remove(friendship);
            await _friendshipRepository.SaveAsync();

            return true;
        }
    }
}