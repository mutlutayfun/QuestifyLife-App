using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QuestifyLife.Application.Wrappers
{
    public class ServiceResponse<T>
    {
        public T Data { get; set; }
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public string[] Errors { get; set; }

        public ServiceResponse()
        {
        }

        public ServiceResponse(T data)
        {
            Data = data;
        }

        public ServiceResponse(string message)
        {
            Success = false;
            Message = message;
        }
    }
}
