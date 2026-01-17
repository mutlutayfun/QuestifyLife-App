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
// Frontend'in çalışacağı adresleri appsettings.json'dan alıyoruz.
// Eğer ayar yoksa varsayılan olarak tümüne izin verir (Geliştirme sırasındaki hatayı önlemek için)
var allowedOrigins = builder.Configuration.GetValue<string>("AllowedOrigins")?.Split(",") ?? new string[] { "*" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("CustomCorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins) // Sadece izin verilen adresler
              .AllowAnyHeader()            // Her türlü başlığa izin ver
              .AllowAnyMethod();           // GET, POST, PUT, DELETE vb. izin ver
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
builder.Services.AddScoped<IGenericRepository<DailyPerformance>, GenericRepository<DailyPerformance>>();

// --- 4. JWT AUTHENTICATION AYARLARI ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]);

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
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
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// FluentValidation Ayarları
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

var app = builder.Build();

// --- 6. MIDDLEWARE PIPELINE ---

// Global Hata Yakalayıcı (En üstte olmalı)
app.UseMiddleware<QuestifyLife.API.Middlewares.GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Canlı ortamda HTTP isteklerini HTTPS'e zorla (Güvenlik için kritik)
    app.UseHsts();
}

app.UseHttpsRedirection();

// CORS Middleware'i (Authentication'dan ÖNCE olmalı)
// "AllowAll" yerine yeni güvenli politikamızı kullanıyoruz.
app.UseCors("CustomCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();