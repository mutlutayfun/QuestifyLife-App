using QuestifyLife.Domain.Common;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PersonalManifesto { get; set; }
    public string AvatarId { get; set; } = "avatar_1";

    // OYUNLAŞTIRMA AYARLARI
    public int DailyTargetPoints { get; set; } = 100; // Varsayılan hedef
    public int TotalXp { get; set; } = 0; // Genel tecrübe puanı (Level sistemi için)
    public int CurrentStreak { get; set; } = 0; // Kaç gündür hedefe ulaşıyor?
    

    // İLİŞKİLER
    public ICollection<Quest> Quests { get; set; } = new List<Quest>();
    public ICollection<DailyPerformance> DailyPerformances { get; set; } = new List<DailyPerformance>();
    public ICollection<Friendship> Friendships { get; set; } = new List<Friendship>();
}
