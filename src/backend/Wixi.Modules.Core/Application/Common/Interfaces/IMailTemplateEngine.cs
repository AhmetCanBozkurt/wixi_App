namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IMailTemplateEngine
{
    /// <summary>
    /// Şablon metnini (HTML) verilen veri nesnesi ile render eder.
    /// </summary>
    /// <param name="template">HTML Şablonu (Scriban formatında)</param>
    /// <param name="data">Dinamik veri nesnesi (Anonymous object veya DTO)</param>
    /// <returns>Render edilmiş HTML çıktısı</returns>
    string Render(string template, object data);
}
