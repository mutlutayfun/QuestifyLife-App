using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IGenericRepository<User> _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public AuthService(IGenericRepository<User> userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<User> RegisterAsync(RegisterRequest request)
    {
        // 1. Aynı email ile kullanıcı var mı kontrol et
        var existingUser = await _userRepository.GetWhere(u => u.Email == request.Email).FirstOrDefaultAsync();
        if (existingUser != null)
        {
            throw new Exception("Bu email adresi zaten kullanılıyor.");
        }

        // 2. Şifreyi Hash'le (Güvenlik)
        var passwordHash = _passwordHasher.Generate(request.Password);

        // 3. Yeni kullanıcı nesnesini oluştur
        var newUser = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            DailyTargetPoints = 100, // Varsayılan hedef
            CreatedDate = DateTime.UtcNow
        };

        // 4. Veritabanına kaydet
        await _userRepository.AddAsync(newUser);
        await _userRepository.SaveAsync();

        return newUser;
    }

    public async Task<User?> LoginAsync(LoginRequest request)
    {
        // 1. Kullanıcıyı bul
        var user = await _userRepository.GetWhere(u => u.Email == request.Email).FirstOrDefaultAsync();
        if (user == null) return null;

        // 2. Şifreyi doğrula
        bool isPasswordCorrect = _passwordHasher.Verify(request.Password, user.PasswordHash);

        if (!isPasswordCorrect) return null;

        return user;
    } 
}

