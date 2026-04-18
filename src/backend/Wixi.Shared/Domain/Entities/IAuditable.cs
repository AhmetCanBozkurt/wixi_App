namespace Wixi.Shared.Domain.Entities;

public interface IAuditable
{
    DateTime CreatedAt { get; set; }
    string? CreatedByUser { get; set; }
    DateTime? UpdatedAt { get; set; }
    string? UpdatedByUser { get; set; }
    bool IsActive { get; set; }
    bool IsDeleted { get; set; }
}
