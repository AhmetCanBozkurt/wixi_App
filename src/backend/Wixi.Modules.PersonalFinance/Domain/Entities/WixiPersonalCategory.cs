using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Domain.Entities;

public class WixiPersonalCategory
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // null = sistem varsayılanı (tüm kullanıcılara ait)
    public Guid? UserId { get; set; }

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public PersonalCategoryType Type { get; set; } = PersonalCategoryType.Expense;

    [StringLength(7)]
    public string Color { get; set; } = "#6366f1";

    [StringLength(50)]
    public string Icon { get; set; } = "💰";

    public bool IsDefault { get; set; } = false;
    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public virtual ICollection<WixiPersonalTransaction> Transactions { get; set; } = [];
    public virtual ICollection<WixiPersonalBudgetCategory> BudgetCategories { get; set; } = [];
    public virtual ICollection<WixiPersonalRecurringTransaction> RecurringTransactions { get; set; } = [];
}
