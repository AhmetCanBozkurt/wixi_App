namespace wixi.Support.DTOs;

public class FAQDto
{
    public int Id { get; set; }
    
    // Multi-language questions
    public string Question_TR { get; set; } = string.Empty;
    public string Question_EN { get; set; } = string.Empty;
    public string Question_DE { get; set; } = string.Empty;
    public string Question_AR { get; set; } = string.Empty;
    
    // Multi-language answers
    public string Answer_TR { get; set; } = string.Empty;
    public string Answer_EN { get; set; } = string.Empty;
    public string Answer_DE { get; set; } = string.Empty;
    public string Answer_AR { get; set; } = string.Empty;
    
    public string Category { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public bool IsFeatured { get; set; }
    public int ViewCount { get; set; }
    public int HelpfulCount { get; set; }
    public int NotHelpfulCount { get; set; }
    public decimal HelpfulRatio { get; set; }
    public string? RelatedLink { get; set; }
    public string? VideoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateFAQDto
{
    public string Question_TR { get; set; } = string.Empty;
    public string Question_EN { get; set; } = string.Empty;
    public string Question_DE { get; set; } = string.Empty;
    public string Question_AR { get; set; } = string.Empty;
    
    public string Answer_TR { get; set; } = string.Empty;
    public string Answer_EN { get; set; } = string.Empty;
    public string Answer_DE { get; set; } = string.Empty;
    public string Answer_AR { get; set; } = string.Empty;
    
    public string Category { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsFeatured { get; set; } = false;
}

public class UpdateFAQDto
{
    public string? Question_TR { get; set; }
    public string? Question_EN { get; set; }
    public string? Question_DE { get; set; }
    public string? Question_AR { get; set; }
    
    public string? Answer_TR { get; set; }
    public string? Answer_EN { get; set; }
    public string? Answer_DE { get; set; }
    public string? Answer_AR { get; set; }
    
    public string? Category { get; set; }
    public string? Tags { get; set; }
    public int? DisplayOrder { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFeatured { get; set; }
}

