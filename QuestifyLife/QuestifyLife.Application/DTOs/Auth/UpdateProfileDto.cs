using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Auth
{
    public class UpdateProfileDto
    {
        public string? PersonalManifesto { get; set; } // "Her gün daha iyiye!"
        public int DailyTargetPoints { get; set; } // Hedefini değiştirebilsin
        public string? AvatarId { get; set; }
    }
}
