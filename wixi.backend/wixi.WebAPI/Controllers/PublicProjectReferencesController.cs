using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using wixi.DataAccess;

namespace wixi.WebAPI.Controllers;

[ApiController]
[Route("api/v1.0/project-references")]
public class PublicProjectReferencesController : ControllerBase
{
    private readonly WixiDbContext _context;

    public PublicProjectReferencesController(WixiDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Aktif proje referanslarını listele (Public)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetActiveReferences([FromQuery] int? limit = null)
    {
        var query = _context.ProjectReferences
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.IsFeatured)
            .ThenBy(p => p.DisplayOrder)
            .ThenByDescending(p => p.CreatedAt)
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
                p.IsFeatured,
                p.DisplayOrder
            });

        var items = limit.HasValue && limit.Value > 0
            ? await query.Take(limit.Value).ToListAsync()
            : await query.ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Tekil proje referansı getir (Public)
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var item = await _context.ProjectReferences
            .Where(p => p.Id == id && p.IsActive)
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
                p.IsFeatured
            })
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound(new { message = "Proje referansı bulunamadı" });

        return Ok(item);
    }

    /// <summary>
    /// İstatistikler (Public)
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult> GetStatistics()
    {
        var totalProjects = await _context.ProjectReferences.CountAsync(p => p.IsActive);
        
        var avgProcessingDays = await _context.ProjectReferences
            .Where(p => p.IsActive && p.ProcessingDays.HasValue)
            .AverageAsync(p => (double?)p.ProcessingDays) ?? 0;

        var fastestProject = await _context.ProjectReferences
            .Where(p => p.IsActive && p.ProcessingDays.HasValue)
            .OrderBy(p => p.ProcessingDays)
            .Select(p => new { p.ProcessingDays, p.Title })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            totalProjects,
            avgProcessingDays = Math.Round(avgProcessingDays, 1),
            fastestProcessingDays = fastestProject?.ProcessingDays ?? 0,
            fastestProjectTitle = fastestProject?.Title
        });
    }
}

