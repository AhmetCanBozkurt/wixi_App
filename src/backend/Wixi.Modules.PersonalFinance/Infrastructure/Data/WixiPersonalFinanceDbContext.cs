using Microsoft.EntityFrameworkCore;
using Wixi.Modules.PersonalFinance.Domain.Entities;

namespace Wixi.Modules.PersonalFinance.Infrastructure.Data;

public class WixiPersonalFinanceDbContext : DbContext
{
    public WixiPersonalFinanceDbContext(DbContextOptions<WixiPersonalFinanceDbContext> options)
        : base(options) { }

    // Personal Finance
    public DbSet<WixiPersonalCategory> PersonalCategories { get; set; }
    public DbSet<WixiPersonalTransaction> PersonalTransactions { get; set; }
    public DbSet<WixiPersonalTransactionShare> PersonalTransactionShares { get; set; }
    public DbSet<WixiPersonalBudget> PersonalBudgets { get; set; }
    public DbSet<WixiPersonalBudgetCategory> PersonalBudgetCategories { get; set; }
    public DbSet<WixiPersonalInstallmentPlan> PersonalInstallmentPlans { get; set; }
    public DbSet<WixiPersonalInstallmentDetail> PersonalInstallmentDetails { get; set; }
    public DbSet<WixiPersonalRecurringTransaction> PersonalRecurringTransactions { get; set; }
    public DbSet<WixiPersonalInvestment> PersonalInvestments { get; set; }
    public DbSet<WixiInvestmentValueCache> InvestmentValueCache { get; set; }

    // Household
    public DbSet<WixiHousehold> Households { get; set; }
    public DbSet<WixiHouseholdMember> HouseholdMembers { get; set; }
    public DbSet<WixiHouseholdInvitation> HouseholdInvitations { get; set; }
    public DbSet<WixiHouseholdBalance> HouseholdBalances { get; set; }
    public DbSet<WixiHouseholdPayment> HouseholdPayments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // WixiInvestmentValueCache — AssetCode + Date unique index
        modelBuilder.Entity<WixiInvestmentValueCache>()
            .HasIndex(x => new { x.AssetCode, x.Date })
            .IsUnique();

        // HouseholdBalance — HouseholdId + UserId unique
        modelBuilder.Entity<WixiHouseholdBalance>()
            .HasIndex(x => new { x.HouseholdId, x.UserId })
            .IsUnique();

        // HouseholdMember — HouseholdId + UserId unique
        modelBuilder.Entity<WixiHouseholdMember>()
            .HasIndex(x => new { x.HouseholdId, x.UserId })
            .IsUnique();

        // PersonalTransaction → Category (no cascade delete)
        modelBuilder.Entity<WixiPersonalTransaction>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Transactions)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // PersonalTransaction → Budget (nullable, no cascade)
        modelBuilder.Entity<WixiPersonalTransaction>()
            .HasOne(t => t.Budget)
            .WithMany(b => b.Transactions)
            .HasForeignKey(t => t.BudgetId)
            .OnDelete(DeleteBehavior.SetNull);

        // PersonalTransaction → Household (nullable)
        modelBuilder.Entity<WixiPersonalTransaction>()
            .HasOne(t => t.Household)
            .WithMany(h => h.Transactions)
            .HasForeignKey(t => t.HouseholdId)
            .OnDelete(DeleteBehavior.SetNull);

        // PersonalTransactionShare → Transaction
        modelBuilder.Entity<WixiPersonalTransactionShare>()
            .HasOne(s => s.Transaction)
            .WithMany(t => t.Shares)
            .HasForeignKey(s => s.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        // PersonalInstallmentPlan → Transaction (1-to-1)
        modelBuilder.Entity<WixiPersonalInstallmentPlan>()
            .HasOne(p => p.Transaction)
            .WithOne(t => t.InstallmentPlan)
            .HasForeignKey<WixiPersonalInstallmentPlan>(p => p.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        // PersonalInstallmentDetail → Plan
        modelBuilder.Entity<WixiPersonalInstallmentDetail>()
            .HasOne(d => d.InstallmentPlan)
            .WithMany(p => p.Details)
            .HasForeignKey(d => d.InstallmentPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        // PersonalBudgetCategory → Budget
        modelBuilder.Entity<WixiPersonalBudgetCategory>()
            .HasOne(bc => bc.Budget)
            .WithMany(b => b.Categories)
            .HasForeignKey(bc => bc.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        // PersonalBudgetCategory → Category
        modelBuilder.Entity<WixiPersonalBudgetCategory>()
            .HasOne(bc => bc.Category)
            .WithMany(c => c.BudgetCategories)
            .HasForeignKey(bc => bc.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // PersonalBudget → Household (nullable optional FK)
        modelBuilder.Entity<WixiPersonalBudget>()
            .HasOne<WixiHousehold>()
            .WithMany(h => h.Budgets)
            .HasForeignKey(b => b.HouseholdId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        // HouseholdMember → Household
        modelBuilder.Entity<WixiHouseholdMember>()
            .HasOne(m => m.Household)
            .WithMany(h => h.Members)
            .HasForeignKey(m => m.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        // HouseholdInvitation → Household
        modelBuilder.Entity<WixiHouseholdInvitation>()
            .HasOne(i => i.Household)
            .WithMany()
            .HasForeignKey(i => i.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        // HouseholdBalance → Household
        modelBuilder.Entity<WixiHouseholdBalance>()
            .HasOne(b => b.Household)
            .WithMany(h => h.Balances)
            .HasForeignKey(b => b.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        // HouseholdPayment → Household
        modelBuilder.Entity<WixiHouseholdPayment>()
            .HasOne(p => p.Household)
            .WithMany()
            .HasForeignKey(p => p.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);

        // Decimal precision
        modelBuilder.Entity<WixiPersonalTransaction>()
            .Property(t => t.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalBudget>()
            .Property(b => b.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalBudgetCategory>()
            .Property(bc => bc.AllocatedAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalBudgetCategory>()
            .Property(bc => bc.SpentAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalInstallmentPlan>()
            .Property(p => p.MonthlyAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalInstallmentDetail>()
            .Property(d => d.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalRecurringTransaction>()
            .Property(r => r.Amount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalInvestment>()
            .Property(i => i.Quantity).HasPrecision(18, 8);
        modelBuilder.Entity<WixiPersonalInvestment>()
            .Property(i => i.PurchasePrice).HasPrecision(18, 4);
        modelBuilder.Entity<WixiInvestmentValueCache>()
            .Property(c => c.Price).HasPrecision(18, 4);
        modelBuilder.Entity<WixiPersonalTransactionShare>()
            .Property(s => s.ShareAmount).HasPrecision(18, 2);
        modelBuilder.Entity<WixiPersonalTransactionShare>()
            .Property(s => s.SharePercentage).HasPrecision(5, 2);
        modelBuilder.Entity<WixiHouseholdBalance>()
            .Property(b => b.NetBalance).HasPrecision(18, 2);
        modelBuilder.Entity<WixiHouseholdPayment>()
            .Property(p => p.Amount).HasPrecision(18, 2);
    }
}
