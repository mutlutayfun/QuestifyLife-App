using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Friends;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
            // 1. Kendine istek atamazsın
            var sender = await _userRepository.GetByIdAsync(request.SenderId);
            if (sender.Email == request.TargetEmail) throw new Exception("Kendine arkadaşlık isteği atamazsın.");

            // 2. Hedef kullanıcı var mı?
            var targetUser = await _userRepository.GetWhere(u => u.Email == request.TargetEmail).FirstOrDefaultAsync();
            if (targetUser == null) throw new Exception("Bu email adresine sahip bir kullanıcı bulunamadı.");

            // 3. Zaten istek var mı veya arkadaşlar mı?
            var existing = await _friendshipRepository.GetWhere(f =>
                (f.RequesterId == request.SenderId && f.AddresseeId == targetUser.Id) ||
                (f.RequesterId == targetUser.Id && f.AddresseeId == request.SenderId))
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                if (existing.Status == FriendshipStatus.Pending) return "Zaten bekleyen bir istek var.";
                if (existing.Status == FriendshipStatus.Accepted) return "Zaten arkadaşsınız.";
            }

            // 4. İsteği oluştur
            var newFriendship = new Friendship
            {
                RequesterId = request.SenderId,
                AddresseeId = targetUser.Id,
                Status = FriendshipStatus.Pending
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
                // Reddedilirse kaydı silebiliriz, böylece tekrar istek atılabilir.
                await _friendshipRepository.RemoveAsync(requestId);
                await _friendshipRepository.SaveAsync();
                return "İstek reddedildi.";
            }
        }

        public async Task<List<FriendRequestListDto>> GetPendingRequestsAsync(Guid userId)
        {
            // Bana (AddresseeId == userId) gelen ve durumu Pending olanları bul
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
            // İki taraflı sorgu: Ben eklemiş olabilirim YA DA o beni eklemiş olabilir.
            var friendships = await _friendshipRepository
                .GetWhere(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendshipStatus.Accepted)
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .ToListAsync();

            var friendList = new List<FriendDto>();

            foreach (var f in friendships)
            {
                // İlişkinin diğer tarafını buluyoruz
                User friendUser;
                if (f.RequesterId == userId)
                {
                    // İstek atan benim, arkadaşım "Addressee"
                    friendUser = f.Addressee;
                }
                else
                {
                    // İstek alan benim, arkadaşım "Requester" (Beni ekleyen kişi)
                    friendUser = f.Requester;
                }

                friendList.Add(new FriendDto
                {
                    FriendId = friendUser.Id,
                    Username = friendUser.Username,
                    TotalXp = friendUser.TotalXp
                });
            }

            // Listeye kendimizi de ekleyelim
            var me = await _userRepository.GetByIdAsync(userId);
            if (me != null)
            {
                friendList.Add(new FriendDto { FriendId = me.Id, Username = me.Username + " (Sen)", TotalXp = me.TotalXp });
            }

            return friendList.OrderByDescending(x => x.TotalXp).ToList();
        }

        public async Task<bool> RemoveFriendAsync(Guid userId, Guid friendId)
        {
            // Arkadaşlık kaydını bul (Yön fark etmeksizin)
            var friendship = await _friendshipRepository.GetWhere(f =>
                (f.RequesterId == userId && f.AddresseeId == friendId) ||
                (f.RequesterId == friendId && f.AddresseeId == userId)
            ).FirstOrDefaultAsync();

            if (friendship == null) return false;

            // Kaydı veritabanından sil
            _friendshipRepository.Remove(friendship);
            await _friendshipRepository.SaveAsync();

            return true;
        }
    }
}
