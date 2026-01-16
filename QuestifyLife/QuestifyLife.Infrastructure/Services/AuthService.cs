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
            var existingUser = await _userRepository.GetWhere(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (existingUser != null) throw new Exception("Bu email adresi zaten kullanılıyor.");

            var existingUsername = await _userRepository.GetWhere(u => u.Username == request.Username).FirstOrDefaultAsync();
            if (existingUsername != null) throw new Exception("Bu kullanıcı adı zaten kullanılıyor.");

            var passwordHash = _passwordHasher.Generate(request.Password);

            var newUser = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                DailyTargetPoints = 100,
                CreatedDate = DateTime.UtcNow
            };

            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveAsync();

            return newUser;
        }

        public async Task<User?> LoginAsync(LoginRequest request)
        {
            var user = await _userRepository
                .GetWhere(u => u.Email == request.UsernameOrEmail || u.Username == request.UsernameOrEmail)
                .FirstOrDefaultAsync();

            if (user == null) return null;

            bool isPasswordCorrect = _passwordHasher.Verify(request.Password, user.PasswordHash);

            if (!isPasswordCorrect) return null;

            return user;
        }

        public async Task<ServiceResponse<bool>> ChangePasswordAsync(Guid userId, string oldPassword, string newPassword)
        {
            var user = await _userRepository.GetWhere(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null) return new ServiceResponse<bool> { Success = false, Message = "Kullanıcı bulunamadı." };

            if (!_passwordHasher.Verify(oldPassword, user.PasswordHash))
                return new ServiceResponse<bool> { Success = false, Message = "Mevcut şifreniz hatalı." };

            user.PasswordHash = _passwordHasher.Generate(newPassword);
            _userRepository.Update(user);
            await _userRepository.SaveAsync();

            return new ServiceResponse<bool> { Data = true, Message = "Şifre başarıyla değiştirildi." };
        }

        // --- YENİ METOTLAR ---

        public async Task<ServiceResponse<string>> ForgotPasswordAsync(string email)
        {
            var user = await _userRepository.GetWhere(u => u.Email == email).FirstOrDefaultAsync();

            // Güvenlik: Kullanıcı yoksa bile "Yok" dememek daha iyidir ama kullanıcı dostu olması için şimdilik diyoruz.
            if (user == null) return new ServiceResponse<string> { Success = false, Message = "Kullanıcı bulunamadı." };

            // Token Oluştur (Basit GUID)
            string resetToken = Guid.NewGuid().ToString();

            // Token'ı kaydet ve 1 saat süre ver
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpires = DateTime.UtcNow.AddHours(1);

            _userRepository.Update(user);
            await _userRepository.SaveAsync();

            // NOT: Gerçek hayatta burada Email servisi çalışır.
            // Biz testi kolaylaştırmak için Token'ı mesajın içinde dönüyoruz.
            return new ServiceResponse<string>
            {
                Success = true,
                Message = "Sıfırlama kodu oluşturuldu.",
                Data = resetToken // Frontend'de yakalayıp test edebilmen için
            };
        }

        public async Task<ServiceResponse<bool>> ResetPasswordAsync(string token, string newPassword)
        {
            var user = await _userRepository
                .GetWhere(u => u.PasswordResetToken == token && u.PasswordResetTokenExpires > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return new ServiceResponse<bool> { Success = false, Message = "Geçersiz veya süresi dolmuş kod." };
            }

            // Yeni şifreyi hashle
            user.PasswordHash = _passwordHasher.Generate(newPassword);

            // Token'ı temizle (tekrar kullanılamasın)
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpires = null;

            _userRepository.Update(user);
            await _userRepository.SaveAsync();

            return new ServiceResponse<bool> { Success = true, Message = "Şifreniz başarıyla sıfırlandı." };
        }
    }
}