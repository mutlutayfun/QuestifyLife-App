using QuestifyLife.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Interfaces
{
    // T: Üzerinde çalışacağımız tablo (User, Quest vb.)
    // where T : BaseEntity -> Sadece bizim BaseEntity'den türeyenler buraya gelebilir kuralı.
    public interface IGenericRepository<T> where T : BaseEntity
    {
        Task<List<T>> GetAllAsync();
        Task<T> GetByIdAsync(Guid id);

        // Filtreli sorgular için (Örn: Sadece tamamlanmış görevleri getir)
        IQueryable<T> GetWhere(Expression<Func<T, bool>> method);

        Task<bool> AddAsync(T model);
        bool Update(T model);
        bool Remove(T model);
        Task<bool> RemoveAsync(Guid id);

        Task<int> SaveAsync();
    }
}