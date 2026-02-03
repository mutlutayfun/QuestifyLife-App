using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Friends
{
    public class FriendRequestListDto
    {
        public Guid RequestId { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public string AvatarId { get; set; } = "avatar_1";
        public DateTime SentDate { get; set; }
    }
}
