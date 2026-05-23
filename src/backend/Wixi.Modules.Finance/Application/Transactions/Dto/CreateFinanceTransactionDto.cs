using System.ComponentModel.DataAnnotations;
using Wixi.Modules.Finance.Domain.Enums;

namespace Wixi.Modules.Finance.Application.Transactions.Dto;

public class CreateFinanceTransactionDto
{
    [Required]
    public Guid CategoryId { get; set; }

    public Guid? BudgetId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public FinanceTransactionType Type { get; set; }

    public List<string>? Tags { get; set; }

    public bool IsInstallment { get; set; } = false;
}
