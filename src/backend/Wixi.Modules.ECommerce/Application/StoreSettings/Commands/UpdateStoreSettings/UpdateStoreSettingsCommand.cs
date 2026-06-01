using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Domain.Entities;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StoreSettings.Commands.UpdateStoreSettings;

public record UpdateStoreSettingsCommand(
    string StoreName,
    string? LogoUrl,
    string? FaviconUrl,
    string? ContactEmail,
    string? ContactPhone,
    string? Address,
    string? SocialLinksJson,
    string? SeoTitle,
    string? SeoDescription,
    string? Keywords,
    string? ThemeConfigJson = null,
    string? LayoutConfigJson = null,
    string? SupportedLanguages = null,
    string? DefaultLanguage = null,
    string? GlobalComponentsConfigJson = null,
    string? CustomCssOverride = null,
    string? CustomJsOverride = null) : IRequest<bool>;

public class UpdateStoreSettingsCommandHandler : IRequestHandler<UpdateStoreSettingsCommand, bool>
{
    private readonly ECommerceDbContext _db;

    public UpdateStoreSettingsCommandHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<bool> Handle(UpdateStoreSettingsCommand request, CancellationToken ct)
    {
        var settings = await _db.StoreSettings.FirstOrDefaultAsync(ct);

        if (settings == null)
        {
            settings = new WixiStoreSettings { Id = Guid.NewGuid() };
            _db.StoreSettings.Add(settings);
        }

        settings.StoreName = request.StoreName;
        settings.LogoUrl = request.LogoUrl;
        settings.FaviconUrl = request.FaviconUrl;
        settings.ContactEmail = request.ContactEmail;
        settings.ContactPhone = request.ContactPhone;
        settings.Address = request.Address;
        settings.SocialLinksJson = request.SocialLinksJson;
        settings.SeoTitle = request.SeoTitle;
        settings.SeoDescription = request.SeoDescription;
        settings.Keywords = request.Keywords;
        
        if (request.ThemeConfigJson != null)
            settings.ThemeConfigJson = request.ThemeConfigJson;
            
        if (request.LayoutConfigJson != null)
            settings.LayoutConfigJson = request.LayoutConfigJson;

        if (request.SupportedLanguages != null)
            settings.SupportedLanguages = request.SupportedLanguages;

        if (request.DefaultLanguage != null)
            settings.DefaultLanguage = request.DefaultLanguage;

        if (request.GlobalComponentsConfigJson != null)
            settings.GlobalComponentsConfigJson = request.GlobalComponentsConfigJson;

        if (request.CustomCssOverride != null)
            settings.CustomCssOverride = request.CustomCssOverride;

        if (request.CustomJsOverride != null)
            settings.CustomJsOverride = request.CustomJsOverride;

        await _db.SaveChangesAsync(ct);
        return true;
    }
}
