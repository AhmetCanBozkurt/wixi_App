using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Domain.Enums;
using Wixi.Modules.Finance.Infrastructure.Data;

namespace Wixi.Modules.Finance;

public static class FinanceModuleExtensions
{
    public static IServiceCollection AddFinanceModule(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<WixiFinanceDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("DefaultConnection bulunamadı.")));

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(FinanceModuleExtensions).Assembly));

        return services;
    }

    public static async Task MigrateFinanceDbAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<WixiFinanceDbContext>();
        await db.Database.MigrateAsync();
        await SeedDefaultCategoriesAsync(db);
    }

    private static async Task SeedDefaultCategoriesAsync(WixiFinanceDbContext db)
    {
        if (await db.FinanceCategories.AnyAsync(c => c.IsDefault)) return;

        var defaults = new[]
        {
            // Expense categories
            new WixiFinanceCategory { Name = "Kira Gideri",            Type = FinanceCategoryType.Expense, Color = "#f97316", Icon = "🏠", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Fatura (E/S/G)",          Type = FinanceCategoryType.Expense, Color = "#eab308", Icon = "💡", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "İnternet & Telefon",      Type = FinanceCategoryType.Expense, Color = "#84cc16", Icon = "📡", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Maaş & Bordro",           Type = FinanceCategoryType.Expense, Color = "#ef4444", Icon = "👥", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Kargo & Lojistik",        Type = FinanceCategoryType.Expense, Color = "#06b6d4", Icon = "📦", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Reklam & Pazarlama",      Type = FinanceCategoryType.Expense, Color = "#8b5cf6", Icon = "📢", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Yazılım & Abonelik",      Type = FinanceCategoryType.Expense, Color = "#64748b", Icon = "💻", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Vergi & SGK",             Type = FinanceCategoryType.Expense, Color = "#dc2626", Icon = "🏛",  IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Ofis & Malzeme",          Type = FinanceCategoryType.Expense, Color = "#6b7280", Icon = "📎", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Diğer Gider",             Type = FinanceCategoryType.Expense, Color = "#374151", Icon = "➖", IsDefault = true, TenantId = null },
            // Income categories
            new WixiFinanceCategory { Name = "Satış Geliri",            Type = FinanceCategoryType.Income,  Color = "#10b981", Icon = "🛒", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Hizmet Geliri",           Type = FinanceCategoryType.Income,  Color = "#6366f1", Icon = "⚡", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Kira Geliri",             Type = FinanceCategoryType.Income,  Color = "#3b82f6", Icon = "🏘",  IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Komisyon Geliri",         Type = FinanceCategoryType.Income,  Color = "#a855f7", Icon = "💎", IsDefault = true, TenantId = null },
            new WixiFinanceCategory { Name = "Diğer Gelir",             Type = FinanceCategoryType.Income,  Color = "#059669", Icon = "➕", IsDefault = true, TenantId = null },
        };

        db.FinanceCategories.AddRange(defaults);
        await db.SaveChangesAsync();
    }
}
