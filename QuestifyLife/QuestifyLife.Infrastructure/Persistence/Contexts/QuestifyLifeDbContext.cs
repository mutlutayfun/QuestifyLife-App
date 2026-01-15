using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using QuestifyLife.Domain.Entities;
using QuestifyLife.Domain.Enums; // BadgeType enum'ı için

namespace QuestifyLife.Infrastructure.Persistence.Contexts
{
    // DbContext sınıfından miras alıyoruz, böylece EF Core yeteneklerini kazanıyoruz.
    public class QuestifyLifeDbContext : DbContext
    {
        // Constructor: Ayarları (hangi DB, connection string vb.) dışarıdan alabilmek için.
        public QuestifyLifeDbContext(DbContextOptions<QuestifyLifeDbContext> options) : base(options)
        {
        }

        // Domain'deki varlıklarımızı veritabanı tablolarına dönüştürüyoruz.
        public DbSet<User> Users { get; set; }
        public DbSet<Quest> Quests { get; set; }
        public DbSet<DailyPerformance> DailyPerformances { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }

        // Veritabanı oluşurken özel ayarlar yapmak için bu metodu eziyoruz (override).
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // --- MEVCUT AYARLARINIZ (KORUNUYOR) ---

            // --- ARKADAŞLIK İLİŞKİSİ AYARLARI ---
            // SQL Server'da "Multiple Cascade Paths" hatası almamak için:
            // Bir kullanıcı silinirse, onun arkadaşlık kayıtlarını otomatik silme işlemini kısıtlıyoruz (Restrict).
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Requester)
                .WithMany() // User'daki Friendships listesini şimdilik boş geçiyoruz karışıklık olmasın diye.
                .HasForeignKey(f => f.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Addressee)
                .WithMany()
                .HasForeignKey(f => f.AddresseeId)
                .OnDelete(DeleteBehavior.Restrict);

            // --- YENİ EKLENEN PERFORMANS İNDEKSLERİ (Tuning) ---

            // 1. Kullanıcı Sorguları (Login/Register Hızı)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique(); // Kullanıcı adı benzersiz olmalı

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique(); // Email benzersiz olmalı

            // 2. Görev Sorguları (Dashboard Hızı)
            // Kullanıcının belirli bir tarihteki görevlerini çekerken hız sağlar.
            modelBuilder.Entity<Quest>()
                .HasIndex(q => new { q.UserId, q.ScheduledDate });

            // 3. Arkadaşlık Sorguları (Liste ve İstek Hızı)
            modelBuilder.Entity<Friendship>()
                .HasIndex(f => f.RequesterId);

            modelBuilder.Entity<Friendship>()
                .HasIndex(f => f.AddresseeId);

            // 4. Günlük Performans Sorguları (İstatistik Hızı)
            modelBuilder.Entity<DailyPerformance>()
                .HasIndex(dp => new { dp.UserId, dp.Date });

            // BaseEntity'den gelen ayarları uyguluyoruz.
            base.OnModelCreating(modelBuilder);
        }
    }
}