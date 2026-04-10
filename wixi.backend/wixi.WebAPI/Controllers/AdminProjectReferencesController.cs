using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;
using wixi.Content.Entities;

namespace wixi.WebAPI.Controllers;

[Authorize(Policy = "AdminOnly")]
[ApiController]
[Route("api/v1.0/admin/project-references")]
public class AdminProjectReferencesController : ControllerBase
{
    private readonly WixiDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public AdminProjectReferencesController(WixiDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    /// <summary>
    /// Tüm proje referanslarını listele (Admin)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var query = _context.ProjectReferences.AsQueryable();

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.IsFeatured)
            .ThenBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.TitleDe,
                p.TitleEn,
                p.TitleAr,
                p.Description,
                p.DescriptionDe,
                p.DescriptionEn,
                p.DescriptionAr,
                p.ClientName,
                p.Country,
                p.DocumentType,
                p.DocumentTypeDe,
                p.DocumentTypeEn,
                p.DocumentTypeAr,
                p.University,
                p.ApplicationDate,
                p.ApprovalDate,
                p.ProcessingDays,
                p.DocumentImageUrl,
                p.Status,
                p.StatusDe,
                p.StatusEn,
                p.StatusAr,
                p.Highlights,
                p.HighlightsDe,
                p.HighlightsEn,
                p.HighlightsAr,
                p.IsActive,
                p.IsFeatured,
                p.DisplayOrder,
                p.CreatedAt,
                p.UpdatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            items,
            total,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(total / (double)pageSize)
        });
    }

    /// <summary>
    /// Tekil proje referansı getir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var item = await _context.ProjectReferences
            .Where(p => p.Id == id)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.TitleDe,
                p.TitleEn,
                p.TitleAr,
                p.Description,
                p.DescriptionDe,
                p.DescriptionEn,
                p.DescriptionAr,
                p.ClientName,
                p.Country,
                p.DocumentType,
                p.DocumentTypeDe,
                p.DocumentTypeEn,
                p.DocumentTypeAr,
                p.University,
                p.ApplicationDate,
                p.ApprovalDate,
                p.ProcessingDays,
                p.DocumentImageUrl,
                p.Status,
                p.StatusDe,
                p.StatusEn,
                p.StatusAr,
                p.Highlights,
                p.HighlightsDe,
                p.HighlightsEn,
                p.HighlightsAr,
                p.IsActive,
                p.IsFeatured,
                p.DisplayOrder,
                p.CreatedAt,
                p.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound(new { message = "Proje referansı bulunamadı" });

        return Ok(item);
    }

    /// <summary>
    /// Yeni proje referansı oluştur
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateProjectReferenceDto dto)
    {
        var userName = User.Identity?.Name ?? "System";

        var projectRef = new ProjectReference
        {
            Title = dto.Title,
            TitleDe = dto.TitleDe,
            TitleEn = dto.TitleEn,
            TitleAr = dto.TitleAr,
            Description = dto.Description,
            DescriptionDe = dto.DescriptionDe,
            DescriptionEn = dto.DescriptionEn,
            DescriptionAr = dto.DescriptionAr,
            ClientName = dto.ClientName,
            Country = dto.Country,
            DocumentType = dto.DocumentType,
            DocumentTypeDe = dto.DocumentTypeDe,
            DocumentTypeEn = dto.DocumentTypeEn,
            DocumentTypeAr = dto.DocumentTypeAr,
            University = dto.University,
            ApplicationDate = dto.ApplicationDate,
            ApprovalDate = dto.ApprovalDate,
            ProcessingDays = dto.ProcessingDays,
            DocumentImageUrl = dto.DocumentImageUrl,
            Status = dto.Status,
            StatusDe = dto.StatusDe,
            StatusEn = dto.StatusEn,
            StatusAr = dto.StatusAr,
            Highlights = dto.Highlights,
            HighlightsDe = dto.HighlightsDe,
            HighlightsEn = dto.HighlightsEn,
            HighlightsAr = dto.HighlightsAr,
            IsActive = dto.IsActive,
            IsFeatured = dto.IsFeatured,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userName
        };

        _context.ProjectReferences.Add(projectRef);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = projectRef.Id }, new { id = projectRef.Id });
    }

    /// <summary>
    /// Proje referansı güncelle
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateProjectReferenceDto dto)
    {
        var projectRef = await _context.ProjectReferences.FindAsync(id);
        if (projectRef == null)
            return NotFound(new { message = "Proje referansı bulunamadı" });

        var userName = User.Identity?.Name ?? "System";

        projectRef.Title = dto.Title;
        projectRef.TitleDe = dto.TitleDe;
        projectRef.TitleEn = dto.TitleEn;
        projectRef.TitleAr = dto.TitleAr;
        projectRef.Description = dto.Description;
        projectRef.DescriptionDe = dto.DescriptionDe;
        projectRef.DescriptionEn = dto.DescriptionEn;
        projectRef.DescriptionAr = dto.DescriptionAr;
        projectRef.ClientName = dto.ClientName;
        projectRef.Country = dto.Country;
        projectRef.DocumentType = dto.DocumentType;
        projectRef.DocumentTypeDe = dto.DocumentTypeDe;
        projectRef.DocumentTypeEn = dto.DocumentTypeEn;
        projectRef.DocumentTypeAr = dto.DocumentTypeAr;
        projectRef.University = dto.University;
        projectRef.ApplicationDate = dto.ApplicationDate;
        projectRef.ApprovalDate = dto.ApprovalDate;
        projectRef.ProcessingDays = dto.ProcessingDays;
        projectRef.DocumentImageUrl = dto.DocumentImageUrl;
        projectRef.Status = dto.Status;
        projectRef.StatusDe = dto.StatusDe;
        projectRef.StatusEn = dto.StatusEn;
        projectRef.StatusAr = dto.StatusAr;
        projectRef.Highlights = dto.Highlights;
        projectRef.HighlightsDe = dto.HighlightsDe;
        projectRef.HighlightsEn = dto.HighlightsEn;
        projectRef.HighlightsAr = dto.HighlightsAr;
        projectRef.IsActive = dto.IsActive;
        projectRef.IsFeatured = dto.IsFeatured;
        projectRef.DisplayOrder = dto.DisplayOrder;
        projectRef.UpdatedAt = DateTime.UtcNow;
        projectRef.UpdatedBy = userName;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Proje referansı güncellendi" });
    }

    /// <summary>
    /// Proje referansı sil
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var projectRef = await _context.ProjectReferences.FindAsync(id);
        if (projectRef == null)
            return NotFound(new { message = "Proje referansı bulunamadı" });

        // Görseli sil
        if (!string.IsNullOrEmpty(projectRef.DocumentImageUrl))
        {
            var imagePath = Path.Combine(_environment.WebRootPath, projectRef.DocumentImageUrl.TrimStart('/'));
            if (System.IO.File.Exists(imagePath))
            {
                System.IO.File.Delete(imagePath);
            }
        }

        _context.ProjectReferences.Remove(projectRef);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Proje referansı silindi" });
    }

    /// <summary>
    /// Proje referansı aktif/pasif durumunu değiştir
    /// </summary>
    [HttpPatch("{id}/toggle-active")]
    public async Task<ActionResult> ToggleActive(int id)
    {
        var projectRef = await _context.ProjectReferences.FindAsync(id);
        if (projectRef == null)
            return NotFound(new { message = "Proje referansı bulunamadı" });

        projectRef.IsActive = !projectRef.IsActive;
        projectRef.UpdatedAt = DateTime.UtcNow;
        projectRef.UpdatedBy = User.Identity?.Name ?? "System";

        await _context.SaveChangesAsync();

        return Ok(new { isActive = projectRef.IsActive, message = "Durum güncellendi" });
    }

    /// <summary>
    /// Proje referansı öne çıkarma durumunu değiştir
    /// </summary>
    [HttpPatch("{id}/toggle-featured")]
    public async Task<ActionResult> ToggleFeatured(int id)
    {
        var projectRef = await _context.ProjectReferences.FindAsync(id);
        if (projectRef == null)
            return NotFound(new { message = "Proje referansı bulunamadı" });

        projectRef.IsFeatured = !projectRef.IsFeatured;
        projectRef.UpdatedAt = DateTime.UtcNow;
        projectRef.UpdatedBy = User.Identity?.Name ?? "System";

        await _context.SaveChangesAsync();

        return Ok(new { isFeatured = projectRef.IsFeatured, message = "Durum güncellendi" });
    }

    /// <summary>
    /// Belge görseli yükle
    /// </summary>
    [HttpPost("upload-image")]
    public async Task<ActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi" });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
            return BadRequest(new { message = "Geçersiz dosya türü. Sadece JPG, PNG ve WEBP desteklenir." });

        if (file.Length > 5 * 1024 * 1024) // 5MB
            return BadRequest(new { message = "Dosya boyutu 5MB'dan büyük olamaz" });

        var uploadsFolder = Path.Combine(_environment.WebRootPath, "CompanyFile", "ProjectReferences");
        Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(fileStream);
        }

        var relativePath = $"/CompanyFile/ProjectReferences/{uniqueFileName}";

        return Ok(new { imageUrl = relativePath });
    }
}

// DTOs
public record CreateProjectReferenceDto(
    string Title,
    string? TitleDe,
    string? TitleEn,
    string? TitleAr,
    string Description,
    string? DescriptionDe,
    string? DescriptionEn,
    string? DescriptionAr,
    string? ClientName,
    string? Country,
    string? DocumentType,
    string? DocumentTypeDe,
    string? DocumentTypeEn,
    string? DocumentTypeAr,
    string? University,
    DateTime? ApplicationDate,
    DateTime? ApprovalDate,
    int? ProcessingDays,
    string? DocumentImageUrl,
    string? Status,
    string? StatusDe,
    string? StatusEn,
    string? StatusAr,
    string? Highlights,
    string? HighlightsDe,
    string? HighlightsEn,
    string? HighlightsAr,
    bool IsActive,
    bool IsFeatured,
    int DisplayOrder
);

public record UpdateProjectReferenceDto(
    string Title,
    string? TitleDe,
    string? TitleEn,
    string? TitleAr,
    string Description,
    string? DescriptionDe,
    string? DescriptionEn,
    string? DescriptionAr,
    string? ClientName,
    string? Country,
    string? DocumentType,
    string? DocumentTypeDe,
    string? DocumentTypeEn,
    string? DocumentTypeAr,
    string? University,
    DateTime? ApplicationDate,
    DateTime? ApprovalDate,
    int? ProcessingDays,
    string? DocumentImageUrl,
    string? Status,
    string? StatusDe,
    string? StatusEn,
    string? StatusAr,
    string? Highlights,
    string? HighlightsDe,
    string? HighlightsEn,
    string? HighlightsAr,
    bool IsActive,
    bool IsFeatured,
    int DisplayOrder
);

