namespace wixi.Email.DTOs;

public class EmailTemplateDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    
    // Multi-language display names (for UI)
    public string DisplayName_TR { get; set; } = string.Empty;
    public string DisplayName_EN { get; set; } = string.Empty;
    public string DisplayName_DE { get; set; } = string.Empty;
    public string DisplayName_AR { get; set; } = string.Empty;
    
    // Multi-language subjects
    public string Subject_TR { get; set; } = string.Empty;
    public string Subject_EN { get; set; } = string.Empty;
    public string Subject_DE { get; set; } = string.Empty;
    public string Subject_AR { get; set; } = string.Empty;
    
    // Multi-language bodies
    public string BodyHtml_TR { get; set; } = string.Empty;
    public string BodyHtml_EN { get; set; } = string.Empty;
    public string BodyHtml_DE { get; set; } = string.Empty;
    public string BodyHtml_AR { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateEmailTemplateDto
{
    public string Key { get; set; } = string.Empty;
    
    public string DisplayName_TR { get; set; } = string.Empty;
    public string DisplayName_EN { get; set; } = string.Empty;
    public string DisplayName_DE { get; set; } = string.Empty;
    public string DisplayName_AR { get; set; } = string.Empty;
    
    public string Subject_TR { get; set; } = string.Empty;
    public string Subject_EN { get; set; } = string.Empty;
    public string Subject_DE { get; set; } = string.Empty;
    public string Subject_AR { get; set; } = string.Empty;
    
    public string BodyHtml_TR { get; set; } = string.Empty;
    public string BodyHtml_EN { get; set; } = string.Empty;
    public string BodyHtml_DE { get; set; } = string.Empty;
    public string BodyHtml_AR { get; set; } = string.Empty;
    
    public string? Description { get; set; }
}

public class UpdateEmailTemplateDto
{
    public string? DisplayName_TR { get; set; }
    public string? DisplayName_EN { get; set; }
    public string? DisplayName_DE { get; set; }
    public string? DisplayName_AR { get; set; }
    
    public string? Subject_TR { get; set; }
    public string? Subject_EN { get; set; }
    public string? Subject_DE { get; set; }
    public string? Subject_AR { get; set; }
    
    public string? BodyHtml_TR { get; set; }
    public string? BodyHtml_EN { get; set; }
    public string? BodyHtml_DE { get; set; }
    public string? BodyHtml_AR { get; set; }
    
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}

