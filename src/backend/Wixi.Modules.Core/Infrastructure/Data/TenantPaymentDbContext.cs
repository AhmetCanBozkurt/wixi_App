using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Core.Domain.Entities;

namespace Wixi.Modules.Core.Infrastructure.Data;

/// <summary>
/// Tenant'ın kendi DB'sine direkt bağlanan minimal context.
/// Sadece WIXI_EC_PAYMENT_SETTINGS tablosunu yönetir.
/// DI üzerinden değil, connection string ile doğrudan oluşturulur.
/// </summary>
public class TenantPaymentDbContext : DbContext
{
    public TenantPaymentDbContext(string connectionString)
        : base(new DbContextOptionsBuilder<TenantPaymentDbContext>()
            .UseSqlServer(connectionString)
            .Options)
    {
    }

    public DbSet<WixiTenantPaymentSetting> PaymentSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<WixiTenantPaymentSetting>(entity =>
        {
            entity.ToTable("WIXI_EC_PAYMENT_SETTINGS");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ActiveGateway).IsRequired().HasMaxLength(30);
            entity.Property(e => e.StripeSecretKey).HasMaxLength(1000);
            entity.Property(e => e.StripePublishableKey).HasMaxLength(1000);
            entity.Property(e => e.StripeWebhookSecret).HasMaxLength(1000);
            entity.Property(e => e.IyzipayApiKey).HasMaxLength(1000);
            entity.Property(e => e.IyzipaySecretKey).HasMaxLength(1000);
            entity.Property(e => e.IyzipayBaseUrl).HasMaxLength(300);
        });
    }
}
