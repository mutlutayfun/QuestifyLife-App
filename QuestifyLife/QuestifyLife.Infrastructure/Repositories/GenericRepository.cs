using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Common;
using QuestifyLife.Infrastructure.Persistence.Contexts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace QuestifyLife.Infrastructure.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly QuestifyLifeDbContext _context;

        public GenericRepository(QuestifyLifeDbContext context)
        {
            _context = context;
        }

        public DbSet<T> Table => _context.Set<T>();

        public async Task<List<T>> GetAllAsync()
        {
            return await Table.ToListAsync();
        }

        public async Task<T> GetByIdAsync(Guid id)
        {
            return await Table.FindAsync(id);
        }

        public IQueryable<T> GetWhere(Expression<Func<T, bool>> method)
        {
            return Table.Where(method);
        }

        public async Task<bool> AddAsync(T model)
        {
            await Table.AddAsync(model);
            return true;
        }

        public bool Update(T model)
        {
            Table.Update(model);
            return true;
        }

        public bool Remove(T model)
        {
            Table.Remove(model);
            return true;
        }

        public async Task<bool> RemoveAsync(Guid id)
        {
            T model = await Table.FindAsync(id);
            if (model == null) return false;
            return Remove(model);
        }

        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
