namespace Wixi.Modules.ECommerce.Application.Crm.Dto;

// ── Müşteri 360° görünümü (M02) ────────────────────────────────────────

public record Customer360Dto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    bool IsEmailVerified,
    bool IsPhoneVerified,
    bool IsActive,
    bool IsGuest,
    DateTime? BirthDate,
    int Gender,
    string? ProfileImagePath,
    // KVKK
    bool EmailOptIn,
    bool SmsOptIn,
    bool PushOptIn,
    DateTime? KvkkConsentDate,
    // Segmentasyon
    string? RfmSegment,
    decimal LtvAmount,
    int TotalOrders,
    DateTime? LastOrderDate,
    // Durum
    bool IsBlacklisted,
    string? BlacklistReason,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    // İlişkili veriler
    IReadOnlyList<CustomerOrderSummaryDto> RecentOrders,
    IReadOnlyList<CustomerNoteDto> Notes,
    IReadOnlyList<CustomerAddressDto> Addresses);

public record CustomerOrderSummaryDto(
    Guid Id,
    string OrderNumber,
    decimal TotalAmount,
    string Currency,
    int Status,
    DateTime CreatedAt);

public record CustomerNoteDto(
    Guid Id,
    Guid CustomerId,
    int NoteType,
    string Content,
    bool IsPrivate,
    string? CreatedByUser,
    DateTime CreatedAt);

public record CustomerAddressDto(
    Guid Id,
    int AddressType,
    string Title,
    string AddressLine,
    string City,
    string District,
    string? CompanyName,
    string? TaxNumber,
    string? TaxOfficeName,
    bool IsDefault);
