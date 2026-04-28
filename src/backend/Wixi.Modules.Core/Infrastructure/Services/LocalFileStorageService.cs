using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Wixi.Modules.Core.Application.Common.Interfaces;

namespace Wixi.Modules.Core.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private const string UploadsFolder = "uploads";

    public LocalFileStorageService(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
    {
        _env = env;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string mimeType)
    {
        var rootPath = _env.WebRootPath;
        if (string.IsNullOrEmpty(rootPath))
        {
            // Fallback for dev environments without wwwroot
            rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsPath = Path.Combine(rootPath, UploadsFolder);
        if (!Directory.Exists(uploadsPath))
        {
            Directory.CreateDirectory(uploadsPath);
        }

        // Generate a unique file name to avoid collisions
        var extension = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(uploadsPath, uniqueFileName);

        using (var outputStream = new FileStream(fullPath, FileMode.Create))
        {
            await fileStream.CopyToAsync(outputStream);
        }

        return $"/{UploadsFolder}/{uniqueFileName}";
    }

    public Task<bool> DeleteAsync(string filePath)
    {
        var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var fullPath = Path.Combine(rootPath, filePath.TrimStart('/'));

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }

    public string GetUrl(string filePath)
    {
        if (string.IsNullOrEmpty(filePath)) return string.Empty;
        if (filePath.StartsWith("http")) return filePath;

        var request = _httpContextAccessor.HttpContext?.Request;
        if (request == null) return filePath;

        var baseUrl = $"{request.Scheme}://{request.Host}";
        return $"{baseUrl}{filePath}";
    }
}
