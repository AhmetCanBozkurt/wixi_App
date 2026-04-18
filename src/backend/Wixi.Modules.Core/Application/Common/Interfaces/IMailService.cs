namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IMailService
{
    /// <summary>
    /// Doğrudan mail gönderir.
    /// </summary>
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);

    /// <summary>
    /// Bir şablon kullanarak mail gönderir.
    /// </summary>
    /// <param name="templateCode">DB'deki şablon kodu</param>
    /// <param name="to">Alıcı adresi</param>
    /// <param name="data">Şablona basılacak veri nesnesi</param>
    Task SendWithTemplateAsync(string templateCode, string to, object data, CancellationToken cancellationToken = default);
}
