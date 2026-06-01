using Microsoft.EntityFrameworkCore;
using Wixi.Modules.Finance.Domain.Entities;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Infrastructure.Data;

public class WixiFinanceDbContext : DbContext
{
    public WixiFinanceDbContext(DbContextOptions<WixiFinanceDbContext> options) : base(options) { }

    public DbSet<WixiFinanceCategory> FinanceCategories { get; set; }
    public DbSet<WixiFinanceTransaction> FinanceTransactions { get; set; }
    public DbSet<WixiFinanceBudget> FinanceBudgets { get; set; }
    public DbSet<WixiFinanceBudgetCategory> FinanceBudgetCategories { get; set; }
    public DbSet<WixiInstallmentPlan> InstallmentPlans { get; set; }
    public DbSet<WixiInstallmentDetail> InstallmentDetails { get; set; }
    public DbSet<WixiRecurringTransaction> RecurringTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Precision
        modelBuilder.Entity<WixiFinanceTransaction>()
            .Property(t => t.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiFinanceBudget>()
            .Property(b => b.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiFinanceBudgetCategory>()
            .Property(bc => bc.AllocatedAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiFinanceBudgetCategory>()
            .Property(bc => bc.SpentAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiInstallmentPlan>()
            .Property(p => p.MonthlyAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiInstallmentDetail>()
            .Property(d => d.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiRecurringTransaction>()
            .Property(r => r.Amount).HasPrecision(18, 2);

        // Transaction → Category (Restrict delete)
        modelBuilder.Entity<WixiFinanceTransaction>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Transactions)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Transaction → Budget (SetNull)
        modelBuilder.Entity<WixiFinanceTransaction>()
            .HasOne(t => t.Budget)
            .WithMany(b => b.Transactions)
            .HasForeignKey(t => t.BudgetId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        // InstallmentPlan → Transaction (1-to-1, Cascade)
        modelBuilder.Entity<WixiInstallmentPlan>()
            .HasOne(p => p.Transaction)
            .WithOne(t => t.InstallmentPlan)
            .HasForeignKey<WixiInstallmentPlan>(p => p.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        // InstallmentDetail → Plan (Cascade)
        modelBuilder.Entity<WixiInstallmentDetail>()
            .HasOne(d => d.InstallmentPlan)
            .WithMany(p => p.Details)
            .HasForeignKey(d => d.InstallmentPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // BudgetCategory → Budget (Cascade)
        modelBuilder.Entity<WixiFinanceBudgetCategory>()
            .HasOne(bc => bc.Budget)
            .WithMany(b => b.Categories)
            .HasForeignKey(bc => bc.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        // BudgetCategory → Category (Restrict)
        modelBuilder.Entity<WixiFinanceBudgetCategory>()
            .HasOne(bc => bc.Category)
            .WithMany(c => c.BudgetCategories)
            .HasForeignKey(bc => bc.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
