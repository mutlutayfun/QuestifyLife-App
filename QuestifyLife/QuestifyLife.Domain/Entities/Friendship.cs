using QuestifyLife.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Domain.Entities;

public class Friendship :BaseEntity
{
    public Guid RequesterId { get; set; } // Arkadaşlık isteği atan
    public User Requester { get; set; }

    public Guid AddresseeId { get; set; } // İsteği alan
    public User Addressee { get; set; }

    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
}
public enum FriendshipStatus
{
    Pending,  // Beklemede
    Accepted, // Kabul Edildi
    Declined, // Reddedildi
    Blocked   // Engellendi
}
