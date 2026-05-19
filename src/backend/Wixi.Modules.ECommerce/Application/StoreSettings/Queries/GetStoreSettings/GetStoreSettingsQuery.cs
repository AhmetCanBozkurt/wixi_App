using MediatR;
using Microsoft.EntityFrameworkCore;
using Wixi.Modules.ECommerce.Application.StoreSettings.Dto;
using Wixi.Modules.ECommerce.Infrastructure.Data;

namespace Wixi.Modules.ECommerce.Application.StoreSettings.Queries.GetStoreSettings;

public record GetStoreSettingsQuery : IRequest<StoreSettingsDto>;

public class GetStoreSettingsQueryHandler : IRequestHandler<GetStoreSettingsQuery, StoreSettingsDto>
{
    private readonly ECommerceDbContext _db;

    public GetStoreSettingsQueryHandler(ECommerceDbContext db)
    {
        _db = db;
    }

    public async Task<StoreSettingsDto> Handle(GetStoreSettingsQuery request, CancellationToken ct)
    {
        var settings = await _db.StoreSettings.AsNoTracking().FirstOrDefaultAsync(ct);

        if (settings == null)
        {
            return new StoreSettingsDto { StoreName = "Yeni Mağazam" };
        }

        return new StoreSettingsDto
        {
            Id = settings.Id,
            StoreName = settings.StoreName,
            LogoUrl = settings.LogoUrl,
            FaviconUrl = settings.FaviconUrl,
            ContactEmail = settings.ContactEmail,
            ContactPhone = settings.ContactPhone,
            Address = settings.Address,
            SocialLinksJson = settings.SocialLinksJson,
            SeoTitle = settings.SeoTitle,
            SeoDescription = settings.SeoDescription,
            Keywords = settings.Keywords,
            ThemeConfigJson = settings.ThemeConfigJson,
            LayoutConfigJson = settings.LayoutConfigJson,
            GlobalComponentsConfigJson = settings.GlobalComponentsConfigJson,
            CustomCssOverride = settings.CustomCssOverride,
            CustomJsOverride = settings.CustomJsOverride,
            SupportedLanguages = settings.SupportedLanguages,
            DefaultLanguage = settings.DefaultLanguage
        };
    }
}
