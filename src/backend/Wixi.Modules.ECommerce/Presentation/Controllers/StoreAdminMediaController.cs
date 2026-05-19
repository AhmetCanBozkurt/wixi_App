using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.ECommerce.Infrastructure.Tenant;

namespace Wixi.Modules.ECommerce.Presentation.Controllers;

[ApiController]
[Route("api/v1/store-admin/media")]
[Authorize(Roles = "TenantAdmin")]
public class StoreAdminMediaController : ControllerBase
{
    private readonly TenantContext _tenant;
    private readonly IWebHostEnvironment _env;

    public StoreAdminMediaController(TenantContext tenant, IWebHostEnvironment env)
    {
        _tenant = tenant;
        _env = env;
    }

    [HttpGet]
    public IActionResult List()
    {
        var slug = _tenant.Slug;
        var dir = Path.Combine(_env.WebRootPath, "uploads", slug);
        if (!Directory.Exists(dir))
            return Ok(new List<object>());

        var files = Directory.GetFiles(dir)
            .Select(f => new
            {
                fileName = Path.GetFileName(f),
                url = $"/uploads/{slug}/{Path.GetFileName(f)}",
                sizeBytes = new FileInfo(f).Length,
                createdAt = new FileInfo(f).CreationTimeUtc
            })
            .OrderByDescending(x => x.createdAt)
            .ToList();

        return Ok(files);
    }

    [HttpDelete("{fileName}")]
    public IActionResult Delete(string fileName)
    {
        if (fileName.Contains('/') || fileName.Contains('\\') || fileName.Contains(".."))
            return BadRequest(new { error = "Geçersiz dosya adı." });

        var slug = _tenant.Slug;
        var path = Path.Combine(_env.WebRootPath, "uploads", slug, fileName);
        if (!System.IO.File.Exists(path))
            return NotFound(new { error = "Dosya bulunamadı." });

        System.IO.File.Delete(path);
        return NoContent();
    }
}
