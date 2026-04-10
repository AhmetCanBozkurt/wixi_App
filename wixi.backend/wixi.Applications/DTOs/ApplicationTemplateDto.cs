namespace wixi.Applications.DTOs;

public class ApplicationTemplateDto
{
    public int Id { get; set; }
    
    // Multi-language names
    public string Name_TR { get; set; } = string.Empty;
    public string Name_EN { get; set; } = string.Empty;
    public string Name_DE { get; set; } = string.Empty;
    public string Name_AR { get; set; } = string.Empty;
    
    // Multi-language descriptions
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    public string Type { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int DisplayOrder { get; set; }
    public string? IconName { get; set; }
    public int? EstimatedDurationDays { get; set; }
    public int? MinDurationDays { get; set; }
    public int? MaxDurationDays { get; set; }
    
    // Step templates
    public List<ApplicationStepTemplateDto> StepTemplates { get; set; } = new();
}

public class ApplicationStepTemplateDto
{
    public int Id { get; set; }
    public int ApplicationTemplateId { get; set; }
    
    // Multi-language titles
    public string Title_TR { get; set; } = string.Empty;
    public string Title_EN { get; set; } = string.Empty;
    public string Title_DE { get; set; } = string.Empty;
    public string Title_AR { get; set; } = string.Empty;
    
    // Multi-language descriptions
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    public int StepOrder { get; set; }
    public string? IconName { get; set; }
    public bool IsRequired { get; set; }
    public bool IsActive { get; set; }
    public int? EstimatedDurationDays { get; set; }
    
    // Sub-step templates
    public List<ApplicationSubStepTemplateDto> SubStepTemplates { get; set; } = new();
}

public class ApplicationSubStepTemplateDto
{
    public int Id { get; set; }
    public int StepTemplateId { get; set; }
    
    // Multi-language names
    public string Name_TR { get; set; } = string.Empty;
    public string Name_EN { get; set; } = string.Empty;
    public string Name_DE { get; set; } = string.Empty;
    public string Name_AR { get; set; } = string.Empty;
    
    // Multi-language descriptions
    public string? Description_TR { get; set; }
    public string? Description_EN { get; set; }
    public string? Description_DE { get; set; }
    public string? Description_AR { get; set; }
    
    public int SubStepOrder { get; set; }
    public bool IsRequired { get; set; }
    public bool IsActive { get; set; }
    public int? EstimatedDurationDays { get; set; }
}

