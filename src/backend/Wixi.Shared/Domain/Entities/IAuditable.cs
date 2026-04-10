namespace Wixi.Shared.Domain.Entities;

public interface IAuditable
{
    DateTime CreatedAt { get; set; }
    DateTime? UpdatedAt { get; set; }
    bool IsActive { get; set; }
    bool IsDeleted { get; set; }
}
