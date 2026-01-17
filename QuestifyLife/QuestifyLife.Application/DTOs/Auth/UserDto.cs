using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Auth;

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public string Email { get; set; } = string.Empty;
    public int DailyTargetPoints { get; set; }
    public int TotalXp { get; set; }
    public bool HasSeenTutorial { get; set; }
}
