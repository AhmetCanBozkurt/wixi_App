using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Transactions.Dto;

public class FinanceTransactionDto
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public Guid? BudgetId { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public FinanceTransactionType Type { get; set; }
    public List<string>? Tags { get; set; }
    public bool IsInstallment { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
