using System.Net;
using System.Text.Json;

namespace QuestifyLife.API.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context); // İsteği bir sonraki aşamaya ilet
            }
            catch (Exception error)
            {
                // Hata olursa yakala ve HandleExceptionAsync'e gönder
                await HandleExceptionAsync(context, error);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            // Varsayılan olarak 500 (Sunucu Hatası) dön
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = new
            {
                StatusCode = context.Response.StatusCode,
                Message = "Sunucu tarafında beklenmeyen bir hata oluştu.",
                Detailed = exception.Message // Geliştirme aşamasında hatayı gör, canlıda gizle!
            };

            // Eğer bizim fırlattığımız "Business Rule" hatasıysa 400 dön
            // (Örn: "Kullanıcı bulunamadı", "Puan yetersiz")
            if (exception.Message.Contains("bulunamadı") || exception.Message.Contains("hata") || exception.Message.Contains("yetkiniz yok"))
            {
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                response = new
                {
                    StatusCode = 400,
                    Message = exception.Message,
                    Detailed = ""
                };
            }

            var jsonResponse = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(jsonResponse);
        }
    }
}