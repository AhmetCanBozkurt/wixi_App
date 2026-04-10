using wixi.CVBuilder.DTOs;

namespace wixi.CVBuilder.Interfaces;

/// <summary>
/// Interface for CV Builder service
/// </summary>
public interface ICVBuilderService
{
    Task<CVDataDto> SaveCVDataAsync(SaveCVDataDto dto, int clientId);
    Task<CVDataDto?> GetCVDataBySessionIdAsync(Guid sessionId);
    Task<CVDataDto?> GetCVDataByPaymentIdAsync(long paymentId);
    Task<bool> UpdateCVDataAsync(Guid sessionId, SaveCVDataDto dto);
    Task<byte[]> ExportToPDFAsync(Guid sessionId);
}

