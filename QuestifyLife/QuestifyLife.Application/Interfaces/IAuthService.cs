using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Interfaces;

public interface IAuthService
{
    Task<User> RegisterAsync(RegisterRequest request);
    Task<User?> LoginAsync(LoginRequest request);
}
