using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.Wrappers;
using QuestifyLife.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Services
{
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

            // Ayrıca Username kontrolü de yapmak iyi olur (Opsiyonel ama önerilir)
            var existingUsername = await _userRepository.GetWhere(u => u.Username == request.Username).FirstOrDefaultAsync();
            if (existingUsername != null)
            {
                throw new Exception("Bu kullanıcı adı zaten kullanılıyor.");
            }

            // 2. Şifreyi Hash'le (IPasswordHasher kullanıyoruz)
            var passwordHash = _passwordHasher.Generate(request.Password);

            // 3. Yeni kullanıcı nesnesini oluştur
            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                // PasswordSalt alanına gerek yok, PasswordHasher bunu hallediyor
                DailyTargetPoints = 100,
                CreatedDate = DateTime.UtcNow
            };

            // 4. Veritabanına kaydet
            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveAsync();

            return newUser;
        }

        public async Task<User?> LoginAsync(LoginRequest request)
        {
            // 1. Kullanıcıyı bul (HEM USERNAME HEM EMAIL KONTROLÜ)
            // request.UsernameOrEmail değeri veritabanındaki Username YA DA Email ile eşleşiyor mu?
            var user = await _userRepository
                .GetWhere(u => u.Email == request.UsernameOrEmail || u.Username == request.UsernameOrEmail)
                .FirstOrDefaultAsync();

            if (user == null) return null;

            // 2. Şifreyi doğrula (IPasswordHasher kullanıyoruz)
            bool isPasswordCorrect = _passwordHasher.Verify(request.Password, user.PasswordHash);

            if (!isPasswordCorrect) return null;

            return user;
        }

        public async Task<ServiceResponse<bool>> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword)
        {
            // 1. Kullanıcıyı Repository üzerinden bul
            var user = await _userRepository.GetWhere(u => u.Id == userId).FirstOrDefaultAsync();

            if (user == null)
            {
                return new ServiceResponse<bool> { Success = false, Message = "Kullanıcı bulunamadı." };
            }

            // 2. Mevcut şifreyi kontrol et
            if (!_passwordHasher.Verify(oldPassword, user.PasswordHash))
            {
                return new ServiceResponse<bool> { Success = false, Message = "Mevcut şifreniz hatalı." };
            }

            // 3. Yeni şifreyi hashle
            var newPasswordHash = _passwordHasher.Generate(newPassword);

            // 4. Kullanıcı bilgilerini güncelle
            user.PasswordHash = newPasswordHash;

            // 5. Kaydet
            _userRepository.Update(user);
            await _userRepository.SaveAsync();

            return new ServiceResponse<bool> { Data = true, Message = "Şifre başarıyla değiştirildi." };
        }
    }
}