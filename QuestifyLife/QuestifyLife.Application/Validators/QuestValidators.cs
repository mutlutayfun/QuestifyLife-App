using FluentValidation;
using QuestifyLife.Application.DTOs.Auth;
using QuestifyLife.Application.DTOs.Quests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Validators
{
    public class CreateQuestRequestValidator : AbstractValidator<CreateQuestRequest>
    {
        public CreateQuestRequestValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Görev başlığı boş olamaz.")
                .MaximumLength(200).WithMessage("Başlık 200 karakterden uzun olamaz.");

            RuleFor(x => x.RewardPoints)
                .GreaterThan(0).WithMessage("Ödül puanı 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(100).WithMessage("Bir görevden en fazla 100 puan kazanabilirsiniz."); // Oyun dengesi için sınır

            //RuleFor(x => x.UserId)
                //.NotEmpty().WithMessage("Kullanıcı ID'si boş olamaz.");

            RuleFor(x => x.ScheduledDate)
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Geçmişe dönük görev planlanamaz.");
        }
    }
}
