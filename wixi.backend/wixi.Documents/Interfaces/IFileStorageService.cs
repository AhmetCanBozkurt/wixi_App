using Microsoft.AspNetCore.Http;
using wixi.Documents.DTOs;

namespace wixi.Documents.Interfaces
{
    public interface IFileStorageService
    {
        Task<FileUploadResult> UploadFileAsync(IFormFile file, string directory, string? customFileName = null);
        Task<bool> DeleteFileAsync(string filePath);
        Task<Stream?> GetFileStreamAsync(string filePath);
        Task<bool> FileExistsAsync(string filePath);
        Task<long> GetFileSizeAsync(string filePath);
        Task<FileValidationResult> ValidateFileAsync(IFormFile file, string[] allowedExtensions, long maxSizeBytes);
    }
}

