using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestifyLife.API.Middlewares;
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

// --- 2. CORS AYARLARI (Canlı Siteye İzin Ver) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins",
        builder =>
        {
            builder.WithOrigins(
                    "http://localhost:5173",                  // Geliştirme (Senin PC)
                    "https://questifylifeapp.vercel.app",     // CANLI SİTE 1
                    "https://questifylifeapp.vercel.app/"     // CANLI SİTE 2 (Slash'lı)
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials(); // Cookie/Auth için gerekli
        });
});

// --- 3. SERVİSLER ---
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

// --- 4. JWT AUTHENTICATION ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
// Eğer secret key yoksa (hata almamak için) varsayılan bir key ata
var secretKeyString = jwtSettings["SecretKey"] ?? "QuestifyLife_Super_Secret_Key_For_Safety_2024!";
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
        ValidIssuer = jwtSettings["Issuer"] ?? "QuestifyLife.API",
        ValidAudience = jwtSettings["Audience"] ?? "QuestifyLife.App",
        IssuerSigningKey = new SymmetricSecurityKey(secretKey)
    };
});

builder.Services.AddControllers();

// --- 5. SWAGGER ---
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
        Description = "Token girmek için: Bearer [boşluk] token"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } }, new string[] {} }
    });
});

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

var app = builder.Build();

// --- 6. MIDDLEWARE ve VERİTABANI OLUŞTURMA (ÖNEMLİ) ---

// *** SİHİRLİ KOD: Veritabanı Tablolarını Otomatik Oluştur ***
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<QuestifyLifeDbContext>();
        context.Database.EnsureCreated(); // Tablolar yoksa oluşturur!
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Veritabanı oluşturulurken hata meydana geldi.");
    }
}

app.UseMiddleware<GlobalExceptionMiddleware>();

// Swagger'ı her zaman açık tut (Canlıda test için)
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// CORS'u aktif et (Auth'dan önce olmalı)
app.UseCors("AllowSpecificOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();