using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/store-admin/upload")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly TenantContext _tenant;
    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    private const long MaxFileSizeBytes = 10 * 1024 * 1024;

    public StoreAdminUploadController(IWebHostEnvironment env, TenantContext tenant)
    {
        _env = env;
        _tenant = tenant;
    }

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "Dosya seçilmedi." });

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { error = "Dosya boyutu 10 MB'ı geçemez." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { error = "Yalnızca görsel dosyaları kabul edilmektedir (jpg, png, gif, webp, svg)." });

        var slug = _tenant.IsResolved ? _tenant.Slug : "global";
        var safeSlug = string.Concat(slug.Where(c => char.IsLetterOrDigit(c) || c == '-'));

        var rootPath = _env.WebRootPath;
        if (string.IsNullOrEmpty(rootPath))
            rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        var uploadDir = Path.Combine(rootPath, "uploads", safeSlug);
        Directory.CreateDirectory(uploadDir);

        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(uploadDir, uniqueName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream, ct);

        var relativePath = $"/uploads/{safeSlug}/{uniqueName}";
        var publicUrl = $"{Request.Scheme}://{Request.Host}{relativePath}";

        return Ok(new { url = publicUrl, relativePath });
    }
}
