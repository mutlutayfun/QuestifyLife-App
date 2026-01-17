using QuestifyLife.Domain.Common;
using System;
using System.Collections;
using System.Collections.Generic;

namespace QuestifyLife.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PersonalManifesto { get; set; }
    public string AvatarId { get; set; } = "avatar_1";
    public bool IsAdmin { get; set; } = false;  

    public bool HasSeenTutorial { get; set; } = false;

    // --- YENİ EKLENEN ALANLAR (Şifre Sıfırlama İçin) ---
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpires { get; set; }
    // ---------------------------------------------------

    // OYUNLAŞTIRMA AYARLARI
    public int DailyTargetPoints { get; set; } = 100;
    public int TotalXp { get; set; } = 0;
    public int Level { get; set; } = 1;
    public int CurrentStreak { get; set; } = 0;

    public int WeeklyTargetPoints { get; set; } = 500;
    public int MonthlyTargetPoints { get; set; } = 2000;
    public int YearlyTargetPoints { get; set; } = 20000;

    // İLİŞKİLER
    public ICollection<Quest> Quests { get; set; } = new List<Quest>();
    public ICollection<DailyPerformance> DailyPerformances { get; set; } = new List<DailyPerformance>();
    public ICollection<Friendship> Friendships { get; set; } = new List<Friendship>();
}