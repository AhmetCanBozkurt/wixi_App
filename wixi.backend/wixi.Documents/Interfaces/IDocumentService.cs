using Microsoft.AspNetCore.Http;
using wixi.Documents.DTOs;

namespace wixi.Documents.Interfaces
{
    public interface IDocumentService
    {
        Task<DocumentDto> UploadDocumentAsync(int clientId, int documentTypeId, IFormFile file);
        Task<ClientDocumentListDto> GetClientDocumentsAsync(int clientId);
        Task<DocumentDto> GetDocumentByIdAsync(long documentId);
        Task<bool> DeleteDocumentAsync(long documentId, int clientId);
        Task<List<DocumentTypeDto>> GetDocumentTypesByEducationAsync(int educationTypeId);
        Task<List<DocumentTypeDto>> GetAllDocumentTypesAsync();
        Task<DocumentTypeDto> CreateDocumentTypeAsync(DocumentTypeDto documentTypeDto);
        Task<DocumentTypeDto> UpdateDocumentTypeAsync(int id, DocumentTypeDto documentTypeDto);
        Task<bool> DeleteDocumentTypeAsync(int id);
        Task<(Stream stream, string fileName, string contentType)> DownloadDocumentAsync(long documentId);
        
        /// <summary>
        /// Admin uploads document for client (e.g., Denklik Belgesi)
        /// Automatically marks as accepted, completes Step 1, starts Step 2 SubStep 1, and sends email
        /// </summary>
        Task<DocumentDto> UploadDocumentForClientAsync(
            int clientId, 
            string documentTypeCode, 
            IFormFile file, 
            int adminUserId, 
            string? notes = null);
    }
}
