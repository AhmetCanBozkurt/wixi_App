using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Wixi.Modules.Core.Application.Common.Interfaces;
using Wixi.Modules.Core.Domain.Entities;
using Wixi.Modules.Core.Infrastructure.Data;

namespace Wixi.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
// [Authorize] // Temporarily disabled for testing or enable if auth is ready
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;
    private readonly WixiCoreDbContext _db;

    public FilesController(IFileStorageService fileStorage, WixiCoreDbContext db)
    {
        _fileStorage = fileStorage;
        _db = db;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string? relatedEntityId, [FromQuery] string? relatedEntityType)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya bulunamadı.");

        try
        {
            using (var stream = file.OpenReadStream())
            {
                var filePath = await _fileStorage.UploadAsync(stream, file.FileName, file.ContentType);
                
                var wixiFile = new WixiFile
                {
                    FileName = file.FileName,
                    FilePath = filePath,
                    MimeType = file.ContentType,
                    Size = file.Length,
                    Extension = Path.GetExtension(file.FileName),
                    StorageProvider = "Local",
                    RelatedEntityId = string.IsNullOrEmpty(relatedEntityId) ? null : Guid.Parse(relatedEntityId),
                    RelatedEntityType = relatedEntityType
                };

                _db.Files.Add(wixiFile);
                await _db.SaveChangesAsync();

                return Ok(new
                {
                    id = wixiFile.Id,
                    url = _fileStorage.GetUrl(filePath),
                    fileName = wixiFile.FileName,
                    mimeType = wixiFile.MimeType,
                    size = wixiFile.Size
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Dosya yüklenirken bir hata oluştu: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var file = await _db.Files.FindAsync(id);
        if (file == null) return NotFound();

        await _fileStorage.DeleteAsync(file.FilePath);
        _db.Files.Remove(file);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Dosya başarıyla silindi." });
    }
}
