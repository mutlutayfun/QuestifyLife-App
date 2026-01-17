using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Application.Validators;
using QuestifyLife.Domain.Entities;
using QuestifyLife.Infrastructure.Persistence.Contexts;
using QuestifyLife.Infrastructure.Repositories;
using QuestifyLife.Infrastructure.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- 1. VERİTABANI BAĞLANTISI ---
builder.Services.AddDbContext<QuestifyLifeDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- 2. CORS AYARLARI (GÜVENLİK GÜNCELLEMESİ) ---
// Not: Canlıya alırken "AllowedOrigins" ayarı appsettings.json'dan gelmezse bile
// kodun içinde Vercel adresin tanımlı olsun diye burayı güncelliyoruz.
var allowedOrigins = new List<string>
{
    "http://localhost:5173",                  // Yerel Geliştirme (Vite)
    "https://questifylifeapp.vercel.app",
    "https://questifylifeapp.vercel.app/",      // CANLI FRONTEND (Vercel)
    "https://questifylife.runasp.net",
    "https://questifylife.runasp.net/"          // CANLI FRONTEND (MonsterASP)"
};

// appsettings.json'dan gelen ekstralar varsa onları da ekle
var configOrigins = builder.Configuration.GetValue<string>("AllowedOrigins")?.Split(",");
if (configOrigins != null)
{
    allowedOrigins.AddRange(configOrigins);
}

// Tekrarları temizle
var distinctOrigins = allowedOrigins.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CustomCorsPolicy", policy =>
    {
        policy.WithOrigins(distinctOrigins) // Sadece izinli siteler
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();          // Auth işlemleri için gerekli
    });
});

// --- 3. SERVİSLERİN ENJEKTE EDİLMESİ (IoC Container) ---
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IQuestService, QuestService>();
builder.Services.AddScoped<IPerformanceService, PerformanceService>();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBadgeService, BadgeService>();
// Admin Paneli Grafikleri için gerekli:
builder.Services.AddScoped<IGenericRepository<DailyPerformance>, GenericRepository<DailyPerformance>>();

// --- 4. JWT AUTHENTICATION AYARLARI ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
// Hata almamak için varsayılan bir key atıyoruz (Production'da appsettings.json'dan gelmeli)
var secretKeyString = jwtSettings["SecretKey"] ?? "QuestifyLife_Secret_Key_For_Dev_Environment_12345";
var secretKey = Encoding.UTF8.GetBytes(secretKeyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "QuestifyLifeAPI",
        ValidAudience = jwtSettings["Audience"] ?? "QuestifyLifeClient",
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

builder.Services.AddControllers();

// --- 5. SWAGGER (API Dokümantasyonu) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "QuestifyLife API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT ile giriş yapmak için: 'Bearer' yazıp boşluk bırakın ve token'ı yapıştırın. Örn: \"Bearer eyJhb...\""
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

var app = builder.Build();

// --- 6. MIDDLEWARE PIPELINE ---

app.UseMiddleware<QuestifyLife.API.Middlewares.GlobalExceptionMiddleware>();

// *** DÜZELTME: Swagger'ı Her Ortamda Aç ***
// Artık "if (IsDevelopment)" bloğunun dışında, yani MonsterASP'de de görünecek.
app.UseSwagger();
app.UseSwaggerUI();

if (!app.Environment.IsDevelopment())
{
    // Canlı ortamda güvenliği artırır
    app.UseHsts();
}

// HTTPS Yönlendirmesi (MonsterASP'de SSL varsa açık kalsın)
app.UseHttpsRedirection();

// CORS Middleware'i (Authentication'dan ÖNCE olmalı)
app.UseCors("CustomCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();