using Microsoft.AspNetCore.Hosting;
using wixi.Documents.Interfaces;
using wixi.Documents.DTOs;

namespace wixi.WebAPI.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<LocalFileStorageService> _logger;
        private readonly string _uploadPath;

        public LocalFileStorageService(IWebHostEnvironment env, ILogger<LocalFileStorageService> logger)
        {
            _env = env;
            _logger = logger;
            _uploadPath = Path.Combine(_env.WebRootPath, "uploads");

            // Ensure upload directory exists
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
                _logger.LogInformation("Created uploads directory at {UploadPath}", _uploadPath);
            }
        }

        public async Task<FileUploadResult> UploadFileAsync(IFormFile file, string directory, string? customFileName = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return new FileUploadResult
                    {
                        Success = false,
                        ErrorMessage = "File is empty or null"
                    };
                }

                string targetDirectory;
                string relativePath;

                // Special handling for TeamMembers: store directly in wwwroot/TeamMembers/ for static file access
                if (directory.Equals("TeamMembers", StringComparison.OrdinalIgnoreCase))
                {
                    targetDirectory = Path.Combine(_env.WebRootPath, "TeamMembers");
                    relativePath = $"TeamMembers/{customFileName ?? $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}"}";
                }
                else
                {
                    // Other files go to uploads subdirectory
                    targetDirectory = Path.Combine(_uploadPath, directory);
                    relativePath = Path.Combine("uploads", directory, customFileName ?? $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}").Replace("\\", "/");
                }

                // Ensure directory exists
                if (!Directory.Exists(targetDirectory))
                {
                    Directory.CreateDirectory(targetDirectory);
                }

                // Generate unique file name
                var extension = Path.GetExtension(file.FileName);
                var storedFileName = customFileName ?? $"{Guid.NewGuid()}{extension}";
                var fullPath = Path.Combine(targetDirectory, storedFileName);

                // Save file
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update relativePath with actual stored filename
                if (directory.Equals("TeamMembers", StringComparison.OrdinalIgnoreCase))
                {
                    relativePath = $"TeamMembers/{storedFileName}";
                }
                else
                {
                    relativePath = Path.Combine("uploads", directory, storedFileName).Replace("\\", "/");
                }

                _logger.LogInformation("File uploaded successfully: {FileName} -> {StoredFileName} at {RelativePath}", file.FileName, storedFileName, relativePath);

                return new FileUploadResult
                {
                    Success = true,
                    FilePath = relativePath,
                    FileName = file.FileName,
                    StoredFileName = storedFileName,
                    FileSizeBytes = file.Length,
                    FileExtension = extension,
                    MimeType = file.ContentType
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file {FileName}", file.FileName);
                return new FileUploadResult
                {
                    Success = false,
                    ErrorMessage = $"File upload failed: {ex.Message}"
                };
            }
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            try
            {
                var fullPath = Path.Combine(_env.WebRootPath, filePath.TrimStart('/'));

                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath));
                    _logger.LogInformation("File deleted: {FilePath}", filePath);
                    return true;
                }

                _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {FilePath}", filePath);
                return false;
            }
        }

        public async Task<Stream?> GetFileStreamAsync(string filePath)
        {
            try
            {
                var fullPath = Path.Combine(_env.WebRootPath, filePath.TrimStart('/'));

                if (!File.Exists(fullPath))
                {
                    _logger.LogWarning("File not found: {FilePath}", filePath);
                    return null;
                }

                var memory = new MemoryStream();
                using (var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;
                return memory;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting file stream for {FilePath}", filePath);
                return null;
            }
        }

        public Task<bool> FileExistsAsync(string filePath)
        {
            try
            {
                var fullPath = Path.Combine(_env.WebRootPath, filePath.TrimStart('/'));
                return Task.FromResult(File.Exists(fullPath));
            }
            catch
            {
                return Task.FromResult(false);
            }
        }

        public Task<long> GetFileSizeAsync(string filePath)
        {
            try
            {
                var fullPath = Path.Combine(_env.WebRootPath, filePath.TrimStart('/'));
                if (File.Exists(fullPath))
                {
                    var fileInfo = new FileInfo(fullPath);
                    return Task.FromResult(fileInfo.Length);
                }
                return Task.FromResult(0L);
            }
            catch
            {
                return Task.FromResult(0L);
            }
        }

        public Task<FileValidationResult> ValidateFileAsync(IFormFile file, string[] allowedExtensions, long maxSizeBytes)
        {
            var result = new FileValidationResult();

            if (file == null || file.Length == 0)
            {
                result.Errors.Add("File is empty or null");
                return Task.FromResult(result);
            }

            // Check file size
            if (file.Length > maxSizeBytes)
            {
                result.Errors.Add($"File size ({FormatFileSize(file.Length)}) exceeds maximum allowed size ({FormatFileSize(maxSizeBytes)})");
            }

            // Check file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                result.Errors.Add($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            result.IsValid = result.Errors.Count == 0;
            return Task.FromResult(result);
        }

        private string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }
}

