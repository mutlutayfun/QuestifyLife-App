using FluentValidation;
using QuestifyLife.Application.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Validators
{
    // Kayıt Olma Kuralları
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Kullanıcı adı boş olamaz.")
                .MinimumLength(3).WithMessage("Kullanıcı adı en az 3 karakter olmalıdır.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email adresi boş olamaz.")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre boş olamaz.")
                .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");
        }
    }

    // Giriş Yapma Kuralları
    public class LoginRequestValidator : AbstractValidator<LoginRequest>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.UsernameOrEmail)
               .NotEmpty().WithMessage("Kullanıcı adı veya E-posta gereklidir.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre gereklidir.");
        }
    }
}
