using Microsoft.EntityFrameworkCore;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Infrastructure.Persistence.Contexts;
using QuestifyLife.Infrastructure.Repositories;
using QuestifyLife.Infrastructure.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using QuestifyLife.Application.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
// ... existing code ...

// 1. Veritabanı Bağlantısını Ekliyoruz
// appsettings.json'dan "DefaultConnection" bilgisini okur ve DbContext'e verir.
builder.Services.AddDbContext<QuestifyLifeDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// REPOSITORY SERVİS KAYDI
// Scoped: Her HTTP isteği (Request) için yeni bir nesne oluşturur.
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IQuestService, QuestService>();
builder.Services.AddScoped<IPerformanceService, PerformanceService>();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBadgeService, BadgeService>();
// ... existing code ...
// Add services to the container.
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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
            .AllowAnyOrigin()   // Her yerden gelen isteği kabul et (Canlıya geçince kısıtlayacağız)
            .AllowAnyMethod()   // GET, POST, PUT, DELETE hepsine izin ver
            .AllowAnyHeader();  // Token header'larına izin ver
        });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "QuestifyLife API", Version = "v1" });

    // 1. Güvenlik Tanımı (Security Definition)
    // Swagger'a "Bearer" tipinde bir token kullanılacağını anlatıyoruz.
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });

    // 2. Güvenlik Gereksinimi (Security Requirement)
    // Tüm endpoint'lerde bu kilidin aktif olabileceğini belirtiyoruz.
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

// FluentValidation'ı sisteme tanıtıyoruz
builder.Services.AddFluentValidationAutoValidation(); // Otomatik validasyon açar
builder.Services.AddFluentValidationClientsideAdapters(); // Client tarafı için

// Validator'ların olduğu Assembly'i (Application katmanını) tarayıp bulmasını söylüyoruz.
// RegisterRequestValidator sınıfının olduğu projedeki tüm validatorları kaydeder.
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseMiddleware<QuestifyLife.API.Middlewares.GlobalExceptionMiddleware>();

app.UseCors("AllowAll");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
