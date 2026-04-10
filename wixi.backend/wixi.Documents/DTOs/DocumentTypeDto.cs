namespace wixi.Documents.DTOs;

public class DocumentTypeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    
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
    
    // Multi-language notes
    public string? Note_TR { get; set; }
    public string? Note_EN { get; set; }
    public string? Note_DE { get; set; }
    public string? Note_AR { get; set; }
    
    public bool IsRequired { get; set; }
    public bool IsActive { get; set; }
    public int? EducationTypeId { get; set; }
    public string? AllowedFileTypes { get; set; }
    public long? MaxFileSizeBytes { get; set; }
    public bool RequiresApproval { get; set; }
    public int DisplayOrder { get; set; }
    public string? IconName { get; set; }
}

