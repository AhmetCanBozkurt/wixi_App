namespace Wixi.Modules.Core.Application.Common.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file to the storage provider.
    /// </summary>
    /// <param name="fileStream">Stream of the file content</param>
    /// <param name="fileName">Original file name</param>
    /// <param name="mimeType">Mime type of the file</param>
    /// <returns>Relative path to the stored file</returns>
    Task<string> UploadAsync(Stream fileStream, string fileName, string mimeType);

    /// <summary>
    /// Deletes a file from the storage provider.
    /// </summary>
    /// <param name="filePath">Relative path to the file</param>
    Task<bool> DeleteAsync(string filePath);

    /// <summary>
    /// Gets the absolute URL of a stored file.
    /// </summary>
    /// <param name="filePath">Relative path to the file</param>
    string GetUrl(string filePath);
}
