using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Quests;
using QuestifyLife.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Interfaces;

public interface IQuestService
{
    Task<Quest> CreateQuestAsync(CreateQuestRequest request);
    Task<List<QuestDto>> GetPendingQuestsAsync(Guid userId); // Yapılacaklar
    Task<OperationResultDto> ToggleQuestStatusAsync(Guid questId, Guid userId);// Görevi tamamla
    Task<bool> DeleteQuestAsync(Guid questId, Guid userId);
    Task<bool> UpdateQuestAsync(UpdateQuestRequest request);
}
