using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Transactions.Dto;

public class UpdateFinanceTransactionDto
{
    [Required]
    public Guid CategoryId { get; set; }

    public Guid? BudgetId { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    public DateTime Date { get; set; }

    public FinanceTransactionType Type { get; set; }

    public List<string>? Tags { get; set; }
}
