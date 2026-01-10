using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.DTOs.Common
{
    public class OperationResultDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;

        // Bu işlem sonucunda kazanılan yeni rozetler varsa buraya dolacak
        public List<string> NewBadges { get; set; } = new List<string>();

        // İstersen kazanılan puanı da dönebilirsin
        public int? EarnedPoints { get; set; }
    }
}
