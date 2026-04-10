using Microsoft.AspNetCore.Http;
using wixi.Forms.DTOs;

namespace wixi.Forms.Interfaces;

/// <summary>
/// Service interface for form submissions
/// </summary>
public interface IFormService
{
    // Employer Form
    Task<EmployerFormDto> SubmitEmployerFormAsync(SubmitEmployerFormDto dto, string ipAddress, string userAgent);
    Task<EmployerFormDto?> GetEmployerFormByIdAsync(int id);
    Task<List<EmployerFormDto>> GetAllEmployerFormsAsync();
    Task<bool> UpdateEmployerFormStatusAsync(int id, string status, string? adminNotes = null);
    
    // Employee Form
    Task<EmployeeFormDto> SubmitEmployeeFormAsync(SubmitEmployeeFormDto dto, string ipAddress, string userAgent);
    Task<EmployeeFormDto> SubmitEmployeeFormAsync(
        string? salutation, string fullName, string email, string phone, 
        string? profession, int? experience, string? education, 
        string? germanLevel, string? additionalInfo, string? specialRequests, 
        string? language, IFormFile? cvFile, 
        string ipAddress, string userAgent);
    Task<EmployeeFormDto?> GetEmployeeFormByIdAsync(int id);
    Task<List<EmployeeFormDto>> GetAllEmployeeFormsAsync();
    Task<bool> UpdateEmployeeFormStatusAsync(int id, string status, string? adminNotes = null);
    
    // Contact Form
    Task<ContactFormDto> SubmitContactFormAsync(SubmitContactFormDto dto, string ipAddress, string userAgent);
    Task<ContactFormDto?> GetContactFormByIdAsync(int id);
    Task<List<ContactFormDto>> GetAllContactFormsAsync();
    Task<bool> UpdateContactFormStatusAsync(int id, string status, string? adminNotes = null);
}

