using System.ComponentModel.DataAnnotations;
using Wixi.Modules.PersonalFinance.Domain.Enums;

namespace Wixi.Modules.PersonalFinance.Application.Transactions.Dto;

public class UpdatePersonalTransactionDto
{
    [Required]
    public Guid CategoryId { get; set; }

    public Guid? BudgetId { get; set; }

    [Required, Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required, StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public PersonalTransactionType Type { get; set; }

    public List<string>? Tags { get; set; }
}
