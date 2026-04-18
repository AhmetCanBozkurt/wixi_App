using Scriban;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class MailTemplateEngine : IMailTemplateEngine
{
    public string Render(string templateContent, object data)
    {
        if (string.IsNullOrEmpty(templateContent))
            return string.Empty;

        try
        {
            var template = Template.Parse(templateContent);

            if (template.HasErrors)
            {
                var errors = string.Join(" | ", template.Messages.Select(x => x.Message));
                throw new Exception($"Scriban Parse Errors: {errors}");
            }

            // Scriban varsayılan olarak Liquid-like render yapar.
            // Model property'lerini doğrudan erişilebilir kılar.
            return template.Render(data);
        }
        catch (Exception ex)
        {
            // Logging can be added here if needed, but throwing for now so caller catches it.
            throw new Exception($"Mail Template Rendering Failed: {ex.Message}", ex);
        }
    }
}
