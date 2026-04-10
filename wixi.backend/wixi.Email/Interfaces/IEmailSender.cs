using wixi.Email.DTOs;

namespace wixi.Email.Interfaces
{
    public interface IEmailSender
    {
        Task SendAsync(EmailMessage message);
    }
}

