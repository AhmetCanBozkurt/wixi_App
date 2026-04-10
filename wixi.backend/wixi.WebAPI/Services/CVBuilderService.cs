using Microsoft.EntityFrameworkCore;
using wixi.CVBuilder.DTOs;
using wixi.CVBuilder.Entities;
using wixi.CVBuilder.Interfaces;
using wixi.DataAccess;

namespace wixi.WebAPI.Services;

/// <summary>
/// Service for CV Builder operations
/// </summary>
public class CVBuilderService : ICVBuilderService
{
    private readonly WixiDbContext _context;
    private readonly ILogger<CVBuilderService> _logger;

    public CVBuilderService(
        WixiDbContext context,
        ILogger<CVBuilderService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CVDataDto> SaveCVDataAsync(SaveCVDataDto dto, int clientId)
    {
        // Validate required fields
        if (!dto.SessionId.HasValue)
        {
            dto.SessionId = Guid.NewGuid();
        }

        // PaymentId is optional - can be set later after payment
        // If PaymentId is not provided, we'll create a CV data entry without it

        // Check if CVData already exists for this session
        var existingCVData = await _context.CVData
            .FirstOrDefaultAsync(c => c.SessionId == dto.SessionId.Value);

        if (existingCVData != null)
        {
            // Update existing
            existingCVData.PersonalInfo = dto.PersonalInfo;
            existingCVData.Experience = dto.Experience;
            existingCVData.Education = dto.Education;
            existingCVData.Skills = dto.Skills;
            existingCVData.Languages = dto.Languages;
            existingCVData.Certificates = dto.Certificates;
            existingCVData.UpdatedAt = DateTime.UtcNow;
            
            if (dto.DocumentId.HasValue)
            {
                existingCVData.DocumentId = dto.DocumentId;
            }

            if (dto.PaymentId.HasValue)
            {
                existingCVData.PaymentId = dto.PaymentId.Value;
            }

            _context.CVData.Update(existingCVData);
            await _context.SaveChangesAsync();

            _logger.LogInformation("CV data updated. SessionId: {SessionId}, ClientId: {ClientId}", 
                dto.SessionId, clientId);

            return MapToDto(existingCVData);
        }
        else
        {
            // Create new
            // Note: PaymentId is required in the entity, so we need to handle this
            // For now, we'll use a placeholder payment ID if not provided
            // In production, you might want to create a pending payment or require payment first
            if (!dto.PaymentId.HasValue)
            {
                throw new Exception("PaymentId is required. Please complete payment first.");
            }

            var cvData = new CVData
            {
                PaymentId = dto.PaymentId.Value,
                ClientId = clientId,
                DocumentId = dto.DocumentId,
                SessionId = dto.SessionId.Value,
                PersonalInfo = dto.PersonalInfo,
                Experience = dto.Experience,
                Education = dto.Education,
                Skills = dto.Skills,
                Languages = dto.Languages,
                Certificates = dto.Certificates,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.CVData.Add(cvData);
            await _context.SaveChangesAsync();

            _logger.LogInformation("CV data created. SessionId: {SessionId}, ClientId: {ClientId}, CVDataId: {CVDataId}", 
                dto.SessionId, clientId, cvData.Id);

            return MapToDto(cvData);
        }
    }

    public async Task<CVDataDto?> GetCVDataBySessionIdAsync(Guid sessionId)
    {
        var cvData = await _context.CVData
            .FirstOrDefaultAsync(c => c.SessionId == sessionId);

        if (cvData == null)
            return null;

        return MapToDto(cvData);
    }

    public async Task<CVDataDto?> GetCVDataByPaymentIdAsync(long paymentId)
    {
        var cvData = await _context.CVData
            .FirstOrDefaultAsync(c => c.PaymentId == paymentId);

        if (cvData == null)
            return null;

        return MapToDto(cvData);
    }

    public async Task<bool> UpdateCVDataAsync(Guid sessionId, SaveCVDataDto dto)
    {
        var cvData = await _context.CVData
            .FirstOrDefaultAsync(c => c.SessionId == sessionId);

        if (cvData == null)
            return false;

        cvData.PersonalInfo = dto.PersonalInfo;
        cvData.Experience = dto.Experience;
        cvData.Education = dto.Education;
        cvData.Skills = dto.Skills;
        cvData.Languages = dto.Languages;
        cvData.Certificates = dto.Certificates;
        cvData.UpdatedAt = DateTime.UtcNow;

        if (dto.DocumentId.HasValue)
        {
            cvData.DocumentId = dto.DocumentId;
        }

        _context.CVData.Update(cvData);
        await _context.SaveChangesAsync();

        _logger.LogInformation("CV data updated. SessionId: {SessionId}", sessionId);
        return true;
    }

    public async Task<byte[]> ExportToPDFAsync(Guid sessionId)
    {
        var cvData = await _context.CVData
            .FirstOrDefaultAsync(c => c.SessionId == sessionId);

        if (cvData == null)
            throw new Exception("CV data not found");

        // TODO: Implement PDF generation using QuestPDF or similar library
        // For now, return empty byte array
        _logger.LogWarning("PDF export not yet implemented. SessionId: {SessionId}", sessionId);
        
        throw new NotImplementedException("PDF export functionality will be implemented in the next phase");
    }

    private static CVDataDto MapToDto(CVData cvData)
    {
        return new CVDataDto
        {
            Id = cvData.Id,
            PaymentId = cvData.PaymentId,
            ClientId = cvData.ClientId,
            DocumentId = cvData.DocumentId,
            SessionId = cvData.SessionId,
            PersonalInfo = cvData.PersonalInfo,
            Experience = cvData.Experience,
            Education = cvData.Education,
            Skills = cvData.Skills,
            Languages = cvData.Languages,
            Certificates = cvData.Certificates,
            CreatedAt = cvData.CreatedAt,
            UpdatedAt = cvData.UpdatedAt
        };
    }
}

