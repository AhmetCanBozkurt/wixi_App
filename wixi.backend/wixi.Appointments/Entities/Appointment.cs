using wixi.Identity.Entities;

namespace wixi.Appointments.Entities;

/// <summary>
/// Represents an appointment/meeting scheduled in the system
/// </summary>
public class Appointment
{
    public long Id { get; set; }
    
    // Appointment details
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    
    // Client information (can be linked to Client entity or standalone)
    public string ClientName { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? ClientEmail { get; set; }
    public int? ClientId { get; set; }  // Optional link to Client entity
    
    // Appointment status and styling
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public string Color { get; set; } = "#3B82F6";  // Hex color for calendar display
    
    // Created by (User from Identity module) - nullable for public appointments
    public int? CreatedById { get; set; }
    public virtual User? CreatedBy { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Computed properties
    public bool IsPast => EndTime < DateTime.UtcNow;
    public bool IsUpcoming => StartTime > DateTime.UtcNow;
    public bool IsCurrent => DateTime.UtcNow >= StartTime && DateTime.UtcNow <= EndTime;
    public TimeSpan Duration => EndTime - StartTime;
}

/// <summary>
/// Appointment status enum
/// </summary>
public enum AppointmentStatus
{
    Pending = 1,      // Beklemede
    Confirmed = 2,    // Onaylandı
    Completed = 3,    // Tamamlandı
    Cancelled = 4     // İptal Edildi
}

/// <summary>
/// Represents a holiday/public holiday
/// </summary>
public class Holiday
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; } = false;  // Yearly recurring holidays
    public string CountryCode { get; set; } = "TR";  // ISO country code
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

