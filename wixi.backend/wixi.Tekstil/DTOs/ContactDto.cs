using System;
using System.Collections.Generic;

namespace wixi.Tekstil.DTOs
{
    public class ContactInfoDto
    {
        public int Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? WorkingHoursWeekday { get; set; }
        public string? WorkingHoursSaturday { get; set; }
        public string? WorkingHoursSunday { get; set; }
        public string Phone1 { get; set; } = string.Empty;
        public string? Phone2 { get; set; }
        public string Email1 { get; set; } = string.Empty;
        public string? Email2 { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public decimal? MapLatitude { get; set; }
        public decimal? MapLongitude { get; set; }
        public int MapZoomLevel { get; set; }
        public string? WhatsAppNumber { get; set; }
        public string? WhatsAppDefaultMessage { get; set; }
        public string? SocialMediaLinks { get; set; }
        public bool IsActive { get; set; }
    }

    public class ContactInfoWithTranslationsDto : ContactInfoDto
    {
        public List<ContactInfoTranslationDto> Translations { get; set; } = new();
    }

    public class ContactInfoTranslationDto
    {
        public string LanguageCode { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? Address { get; set; }
        public string? WorkingHoursWeekday { get; set; }
        public string? WorkingHoursSaturday { get; set; }
        public string? WorkingHoursSunday { get; set; }
        public string? WhatsAppDefaultMessage { get; set; }
    }

    public class UpdateContactInfoDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? WorkingHoursWeekday { get; set; }
        public string? WorkingHoursSaturday { get; set; }
        public string? WorkingHoursSunday { get; set; }
        public string Phone1 { get; set; } = string.Empty;
        public string? Phone2 { get; set; }
        public string Email1 { get; set; } = string.Empty;
        public string? Email2 { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public decimal? MapLatitude { get; set; }
        public decimal? MapLongitude { get; set; }
        public int MapZoomLevel { get; set; } = 15;
        public string? WhatsAppNumber { get; set; }
        public string? WhatsAppDefaultMessage { get; set; }
        public string? SocialMediaLinks { get; set; }
        public List<ContactInfoTranslationDto>? Translations { get; set; }
    }

    public class ContactSubmissionDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Subject { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public int? AssignedTo { get; set; }
        public string? AssignedToName { get; set; }
        public DateTime? AssignedAt { get; set; }
        public string? ResponseMessage { get; set; }
        public DateTime? ResponseDate { get; set; }
        public int? ResponseBy { get; set; }
        public string? ResponseByName { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? Tags { get; set; }
        public string Source { get; set; } = string.Empty;
        public string LanguageCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateContactSubmissionDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Subject { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Source { get; set; } = "Website";
        public string LanguageCode { get; set; } = "tr";
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? ReferrerUrl { get; set; }
    }

    public class CreateOrUpdateContactInfoDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone1 { get; set; } = string.Empty;
        public string? Phone2 { get; set; }
        public string Email1 { get; set; } = string.Empty;
        public string? Email2 { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? PostalCode { get; set; }
        public decimal? MapLatitude { get; set; }
        public decimal? MapLongitude { get; set; }
        public string? WhatsAppNumber { get; set; }
        public bool IsActive { get; set; } = true;
        public int UpdatedBy { get; set; }
        public List<ContactInfoTranslationDto>? Translations { get; set; }
    }

    public class UpdateContactSubmissionDto
    {
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public int? AssignedTo { get; set; }
        public string? ResponseMessage { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? Tags { get; set; }
    }

    public class UpdateContactSubmissionStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? ResponseMessage { get; set; }
        public int UpdatedBy { get; set; }
    }

    public class ContactSubmissionListQueryDto
    {
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public int? AssignedTo { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; } = "CreatedAt";
        public string? SortOrder { get; set; } = "desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class ContactSubmissionListResponseDto
    {
        public List<ContactSubmissionDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public ContactSubmissionStatsDto Stats { get; set; } = new();
    }

    public class ContactSubmissionStatsDto
    {
        public int NewCount { get; set; }
        public int InProgressCount { get; set; }
        public int CompletedCount { get; set; }
        public int CancelledCount { get; set; }
        public int TotalCount { get; set; }
    }
}

