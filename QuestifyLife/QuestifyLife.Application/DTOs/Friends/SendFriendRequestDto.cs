using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Friends
{
    public class SendFriendRequestDto
    {
        public Guid SenderId { get; set; }
        public string UsernameOrEmail { get; set; } = string.Empty;
    }
}

