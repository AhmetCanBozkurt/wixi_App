using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.PersonalFinance.Infrastructure.Data;

namespace Wixi.Modules.PersonalFinance;

public static class PersonalFinanceModuleExtensions
{
    public static IServiceCollection AddPersonalFinanceModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<WixiPersonalFinanceDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection bulunamadı.")));

        // MediatR — bu assembly'deki handler'ları kaydet
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(PersonalFinanceModuleExtensions).Assembly));

        return services;
    }

    public static async Task MigratePersonalFinanceDbAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WixiPersonalFinanceDbContext>();
        await db.Database.MigrateAsync();

        await SeedDefaultCategoriesAsync(db);
    }

    private static async Task SeedDefaultCategoriesAsync(WixiPersonalFinanceDbContext db)
    {
        if (await db.PersonalCategories.AnyAsync(c => c.IsDefault)) return;

        var defaults = new[]
        {
            new Domain.Entities.WixiPersonalCategory { Name = "Market & Gıda",           Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#ef4444", Icon = "🛒", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Kira",                    Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#f97316", Icon = "🏠", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Fatura (Elektrik/Su/Gaz)", Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#eab308", Icon = "💡", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Ulaşım",                  Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#84cc16", Icon = "🚌", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Sağlık",                  Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#22c55e", Icon = "🏥", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Eğitim",                  Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#06b6d4", Icon = "📚", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Eğlence & Restoran",      Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#8b5cf6", Icon = "🎭", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Giyim",                   Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#ec4899", Icon = "👕", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Taksit Ödemesi",          Type = Domain.Enums.PersonalCategoryType.Expense, Color = "#64748b", Icon = "💳", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Maaş",                    Type = Domain.Enums.PersonalCategoryType.Income,  Color = "#10b981", Icon = "💰", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Kira Geliri",             Type = Domain.Enums.PersonalCategoryType.Income,  Color = "#3b82f6", Icon = "🏘️", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Serbest Çalışma",         Type = Domain.Enums.PersonalCategoryType.Income,  Color = "#6366f1", Icon = "💻", IsDefault = true, UserId = null },
            new Domain.Entities.WixiPersonalCategory { Name = "Diğer Gelir",             Type = Domain.Enums.PersonalCategoryType.Income,  Color = "#a855f7", Icon = "➕", IsDefault = true, UserId = null },
        };

        db.PersonalCategories.AddRange(defaults);
        await db.SaveChangesAsync();
    }
}
