using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestifyLife.API.Extensions;
using QuestifyLife.Application.DTOs.Common;
using QuestifyLife.Application.Interfaces;
using QuestifyLife.Domain.Entities;
using QuestifyLife.Infrastructure.Persistence.Contexts;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace QuestifyLife.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FeedbackController : ControllerBase
    {
        private readonly IGenericRepository<Feedback> _feedbackRepository;
        private readonly QuestifyLifeDbContext _context; // User bilgilerine erişmek için
        private readonly IConfiguration _configuration; // Email ayarları için

        public FeedbackController(
            IGenericRepository<Feedback> feedbackRepository,
            QuestifyLifeDbContext context,
            IConfiguration configuration)
        {
            _feedbackRepository = feedbackRepository;
            _context = context;
            _configuration = configuration;
        }

        // KULLANICI: Geri Bildirim Gönder
        [HttpPost]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto request)
        {
            var userId = User.GetUserId();

            var feedback = new Feedback
            {
                UserId = userId,
                Subject = request.Subject,
                Message = request.Message,
                Rating = request.Rating,
                IsReviewed = false,
                CreatedDate = System.DateTime.UtcNow
            };

            await _feedbackRepository.AddAsync(feedback);
            await _feedbackRepository.SaveAsync();

            return Ok(new { success = true, message = "Geri bildiriminiz için teşekkürler! 🚀" });
        }

        // ADMIN: Tüm Geri Bildirimleri Getir
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            // Entity'de 'User' navigasyon özelliği olmadığı için Join kullanıyoruz
            // Bu yöntem migration gerektirmez ve UserId üzerinden eşleştirme yapar.
            var feedbacks = await _context.Feedbacks
                .Join(_context.Users,
                      f => f.UserId,
                      u => u.Id,
                      (f, u) => new FeedbackAdminDto
                      {
                          Id = f.Id,
                          UserId = f.UserId,
                          Username = u.Username,
                          UserEmail = u.Email,
                          Subject = f.Subject,
                          Message = f.Message,
                          Rating = f.Rating,
                          IsReviewed = f.IsReviewed,
                          CreatedDate = f.CreatedDate
                      })
                .OrderByDescending(f => f.CreatedDate)
                .ToListAsync();

            return Ok(feedbacks);
        }

        // ADMIN: Cevapla ve E-posta Gönder
        [HttpPost("admin/reply")]
        public async Task<IActionResult> ReplyFeedback([FromBody] ReplyFeedbackDto request)
        {
            var feedback = await _feedbackRepository.GetByIdAsync(request.FeedbackId);
            if (feedback == null) return NotFound("Geri bildirim bulunamadı.");

            var user = await _context.Users.FindAsync(feedback.UserId);
            if (user == null) return NotFound("Kullanıcı bulunamadı.");

            try
            {
                // 1. E-POSTA GÖNDERME İŞLEMİ
                // Bu ayarları appsettings.json'dan çekmek en doğrusudur.
                // Şimdilik varsayılan bir yapı kuruyoruz.

                // NOT: Eğer SMTP ayarların yoksa bu blok hata verebilir, try-catch ile sardık.
                // Gerçekten mail atmak için Gmail App Password veya MonsterASP mail ayarlarını girmelisin.

                string smtpServer = _configuration["EmailSettings:Host"] ?? "smtp.gmail.com";
                int port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
                string senderEmail = _configuration["EmailSettings:Email"] ?? "questifylife.app@gmail.com";
                string password = _configuration["EmailSettings:Password"] ?? "your-app-password";

                if (senderEmail != "questifylife.app@gmail.com" && password != "your-app-password")
                {
                    using (var client = new SmtpClient(smtpServer, port))
                    {
                        client.EnableSsl = true;
                        client.Credentials = new NetworkCredential(senderEmail, password);

                        var mailMessage = new MailMessage
                        {
                            From = new MailAddress(senderEmail, "QuestifyLife Admin"),
                            Subject = $"Re: {feedback.Subject} - QuestifyLife Geri Bildirim",
                            Body = $@"
                            <h3>Merhaba {user.Username},</h3>
                            <p>Geri bildiriminiz bizim için çok değerli. Mesajınızı inceledik:</p>
                            <blockquote style='background: #f0f0f0; padding: 10px; border-left: 4px solid #3498db;'>
                                <em>{feedback.Message}</em>
                            </blockquote>
                            <p><strong>Cevabımız:</strong></p>
                            <p>{request.ReplyMessage}</p>
                            <br/>
                            <p>Teşekkürler,<br/>QuestifyLife Ekibi 🚀</p>
                            ",
                            IsBodyHtml = true
                        };
                        mailMessage.To.Add(user.Email);

                        await client.SendMailAsync(mailMessage);
                    }
                }
                else
                {
                    // SMTP ayarlı değilse sadece logla (Development için)
                    System.Console.WriteLine($"[EMAIL SIMULATION] To: {user.Email}, Msg: {request.ReplyMessage}");
                }

                // 2. VERİTABANI GÜNCELLEME
                feedback.IsReviewed = true;
                _feedbackRepository.Update(feedback);
                await _feedbackRepository.SaveAsync();

                return Ok(new { success = true, message = "Cevap gönderildi ve incelendi olarak işaretlendi." });
            }
            catch (System.Exception ex)
            {
                return BadRequest($"E-posta gönderilirken hata oluştu: {ex.Message}. Ancak veritabanı güncellenmedi.");
            }
        }
    }
}