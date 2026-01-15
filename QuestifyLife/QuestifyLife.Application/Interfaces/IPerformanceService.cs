using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.DTOs.Performance;
using QuestifyLife.Application.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Interfaces
{
    public interface IPerformanceService
    {
        // Ana ekran verilerini getirir
        Task<DashboardDto> GetDashboardAsync(Guid userId, DateTime? date = null);

        // Günü kapatır, yapılmayanlardan ceza keser
        // GÜNCELLEME: Artık not parametresi de alıyor
        Task<OperationResultDto> FinishDayAsync(Guid userId, string? dayNote);

        // YENİ: Takvim Verisi
        Task<List<CalendarDayDto>> GetCalendarDataAsync(Guid userId, int year, int month);
        Task<ServiceResponse<List<LeaderboardUserDto>>> GetLeaderboardAsync(Guid currentUserId);
        //Task UpdateDailyPerformanceAsync(string userId);
    }
}