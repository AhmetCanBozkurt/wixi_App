using System.Net;
using System.Security.Cryptography;
using System.Text;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Wixi.Modules.Core.Application.Auth.Dto;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.Modules.Core.Application.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, AuthResult>
{
    private readonly UserManager<WixiUser> _userManager;
    private readonly IMailService _mailService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IConfiguration _configuration;
    private readonly WixiCoreDbContext _dbContext;

    public ForgotPasswordCommandHandler(
        UserManager<WixiUser> userManager,
        IMailService mailService,
        IHttpContextAccessor httpContextAccessor,
        IConfiguration configuration,
        WixiCoreDbContext dbContext)
    {
        _userManager = userManager;
        _mailService = mailService;
        _httpContextAccessor = httpContextAccessor;
        _configuration = configuration;
        _dbContext = dbContext;
    }

    public async Task<AuthResult> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var http = _httpContextAccessor.HttpContext;
        var ip = http?.Connection.RemoteIpAddress?.ToString();
        var ua = http?.Request.Headers["User-Agent"].ToString();

        if (string.IsNullOrWhiteSpace(request.Email))
            return new AuthResult { Success = false, ErrorMessage = "E-posta zorunludur." };

        var normalized = request.Email.Trim().ToLowerInvariant();
        var fingerprint = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(normalized)))[..16];

        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            await _dbContext.LogSecurityEventAsync(
                "FORGOT_PASSWORD_REQUEST",
                $"Talep alındı (hesap yok veya gizlendi). email_fp={fingerprint}",
                null,
                null,
                null,
                ip,
                ua,
                cancellationToken);
            return new AuthResult { Success = true };
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebUtility.UrlEncode(token);
        var encodedEmail = WebUtility.UrlEncode(user.Email);

        var configuredBaseUrl = _configuration["AppUrls:FrontendBaseUrl"];
        var origin = _httpContextAccessor.HttpContext?.Request.Headers["Origin"].ToString();
        var baseUrl = !string.IsNullOrWhiteSpace(configuredBaseUrl)
            ? configuredBaseUrl!
            : (string.IsNullOrWhiteSpace(origin) ? "http://localhost:5173" : origin!);

        var resetLink = $"{baseUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

        var fullName = $"{user.FirstName} {user.LastName}".Trim();
        var subject = "Wixi Şifre Sıfırlama Talebi";
        var body = $@"
<div style=""font-family: Arial, sans-serif; padding: 20px; color: #111827;"">
  <h2 style=""margin:0 0 8px 0;"">Merhaba {WebUtility.HtmlEncode(fullName)},</h2>
  <p style=""margin:0 0 14px 0;"">Hesabınız için bir şifre sıfırlama talebi aldık.</p>
  <p style=""margin:0 0 14px 0;"">Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
  <p style=""margin: 18px 0;"">
    <a href=""{resetLink}"" style=""display:inline-block; padding:12px 18px; background:#2563eb; color:#fff; text-decoration:none; border-radius:10px; font-weight:700;"">Şifremi Sıfırla</a>
  </p>
  <p style=""margin:0 0 8px 0; font-size: 0.92em; color:#374151;"">
    Buton tıklanamazsa linki kopyalayıp tarayıcıya yapıştırın:
  </p>
  <p style=""margin:0 0 14px 0; font-size:0.92em; word-break:break-all;"">
    <a href=""{resetLink}"" style=""color:#2563eb;"">{resetLink}</a>
  </p>
  <div style=""margin:0 0 14px 0; font-size:0.9em; word-break:break-all; background:#f3f4f6; padding:10px 12px; border:1px solid #e5e7eb; border-radius:10px;"">
    {resetLink}
  </div>
  <p style=""margin:0; font-size: 0.9em; color:#6b7280;"">
    Eğer bu talebi siz yapmadıysanız, hesabınız güvendedir ve bu e-postayı dikkate almayabilirsiniz.
  </p>
  <p style=""margin-top:16px; font-size:0.9em; color:#6b7280;"">Saygılarımızla,<br/><strong>Wixi Ekibi</strong></p>
</div>";

        await _mailService.SendEmailAsync(user.Email!, subject, body, cancellationToken);

        await _dbContext.LogSecurityEventAsync(
            "FORGOT_PASSWORD_REQUEST",
            $"Sıfırlama maili gönderildi. email_fp={fingerprint}",
            user.Id.ToString(),
            user.Email,
            fullName,
            ip,
            ua,
            cancellationToken);

        return new AuthResult { Success = true };
    }
}
