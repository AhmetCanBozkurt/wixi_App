namespace wixi.Identity.DTOs;

public class SortConfigDto
{
    public string? Key { get; set; }
    public string? Direction { get; set; } // "asc" | "desc" | null
}

public class TablePreferenceDto
{
    public string TableKey { get; set; } = string.Empty;
    public List<string> VisibleColumns { get; set; } = new();
    public List<string> ColumnOrder { get; set; } = new();
    public Dictionary<string, object>? ColumnFilters { get; set; }
    public SortConfigDto? SortConfig { get; set; }
    public int PageSize { get; set; } = 20;
}

public class UpdateTablePreferenceDto : TablePreferenceDto
{
}

