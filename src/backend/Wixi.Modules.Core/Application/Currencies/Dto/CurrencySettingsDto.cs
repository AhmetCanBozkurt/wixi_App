namespace Wixi.Modules.Core.Application.Currencies.Dto;

public class CurrencySettingsDto
{
    public Guid Id { get; set; }
    public string BaseCurrencyCode { get; set; } = "TRY";
    public bool TcmbAutoSyncEnabled { get; set; }
    public DateTime? LastSyncedAt { get; set; }
    public string? LastSyncStatus { get; set; }
}
