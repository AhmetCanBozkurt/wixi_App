using System.ComponentModel.DataAnnotations;

namespace wixi.Identity.Entities;

public class UserTablePreference
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [MaxLength(200)]
    public string TableKey { get; set; } = string.Empty;

    public string VisibleColumns { get; set; } = "[]";
    public string ColumnOrder { get; set; } = "[]";
    public string ColumnFilters { get; set; } = "{}";
    public string SortConfig { get; set; } = "{}";
    public int PageSize { get; set; } = 20;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
}

